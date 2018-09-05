(() => {
    'use strict';

    const crypto = require('crypto');

    const defaultOptions = {
        __hashType: 'sha256',

        /*
        * Create a hash
        * @param {Buffer} value
        * @return {Buffer}
        */
        hashFunction: function(value) {
            value = Buffer.from(value);
            return crypto.createHash(this.__hashType).update(value).digest();
        },

        /*
        * Sort hash
        */
        sortFunction: Buffer.compare
    }

    let config = defaultOptions;
    let tree = {
        leaves: {},             // { @base64_string: @buffer }
        leaveKeys: [],          // [ @hash_buffer, ... ]
        levels: [],             // [ [ @hash_buffer, ... ], ... ]
        isReady: false
    };

    class MerkleTree {
        constructor(options = defaultOptions) {
            // init hash and sort function
            config.hashFunction = __assignFunction(config.hashFunction, options.hashFunction);
            config.sortFunction = __assignFunction(config.sortFunction, options.sortFunction);
        }

        insert(values) {
            values = (__isArray(values)) ? values : [values];

            tree.isReady = false;
            values.forEach((value) => {
                let hash = config.hashFunction(value);
                let hashStr = __bufferToString(hash);
                tree.leaves[hashStr] = value
                tree.leaveKeys.push(hash);
            });
            this.sort();
        }

        delete(indexes) {
            indexes = (__isArray(indexes)) ? indexes : [indexes];

            tree.isReady = false;
            indexes.forEach((hash) => {
                let hashStr = __bufferToString(hash);
                delete tree.leaves[hashStr];
                tree.leaveKeys = __buffersRemoveItem(tree.leaveKeys, hash);
            });
            this.sort();
        }

        findOne(index) {
            let hashStr = __bufferToString(index);
            return tree.leaves[hashStr];
        }

        resetTree() {
            tree = {
                leaves: {},
                leaveKeys: [],
                levels: [],
                isReady: false
            };
        }

        makeTree() {
            tree.isReady = false;
            if (this.getLeafCount()) {
                tree.levels = [];
                tree.levels.unshift(tree.leaveKeys);
                while(tree.levels[0].length > 1) {
                    tree.levels.unshift(__calculateNextLevel());
                }
            }
            tree.isReady = true;
        }

        sort() {
            // sort hash
            tree.leaveKeys.sort(config.sortFunction);
        }

        getTreeStat() {
            return tree.isReady;
        }

        getTreeLeaves() {
            return tree.leaves;
        }

        getLeafCount() {
            return tree.leaveKeys.length;
        }

        getTreeLevels() {
            return tree.levels;
        }

        get rootHash() {
            if (__isArray([tree.levels]) && __isArray(tree.levels[0])) {
                return tree.levels[0][0] || '';
            }

            return '';
        }

        get __tree() {
            return tree;
        }
    }

    module.exports = MerkleTree;

    function __isArray(value) {
        return Array.isArray(value);
    }

    function __isFunction(value) {
        return (typeof(value) === 'function');
    }

    function __assignFunction(oldValue, newValue) {
        return ((__isFunction(newValue)) ? newValue : oldValue);
    }

    function __buffersRemoveItem(arr, item) {
        return arr.filter(buf => !(buf.equals(item)));
    }

    function __bufferToString(buf, type = 'base64') {
        return buf.toString(type);
    }

    function __calculateNextLevel() {
        const nodes = [];
        const topLevel = tree.levels[0];
        const topLevelCnt = topLevel.length;

        for (let x = 0; x < topLevelCnt; x += 2) {
            if (x + 1 <= topLevelCnt - 1) {
                nodes.push(config.hashFunction(Buffer.concat([topLevel[x], topLevel[x + 1]])));
            }
            else {
                nodes.push(topLevel[x]);
            }
        }

        return nodes;
    }
})();
