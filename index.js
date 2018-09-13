(() => {
    'use strict';

    const crypto = require('crypto');

    const defaultOptions = {
        __hashType: 'sha256',
        __stringType: 'base64url',

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
        * Compare hash
        */
        compareFunction: Buffer.compare
    }

    let config = defaultOptions;

    /*
    Tree structure:
    {
        leaves: {
            @Base64url_string: @Buffer,
            ...
        },
        leaveKeys: [@Hash_buffer, ...],
        levels: [
            [@Hash_buffer, ...],
            ...
        ],
        isReady: @boolean
    }
    */
    let tree = {
        leaves: {},
        leaveKeys: [],
        levels: [],
        isReady: false
    };

    class MerkleTree {
        constructor(options = defaultOptions) {
            // init hash and compare function
            config.hashFunction = __assignFunction(config.hashFunction, options.hashFunction);
            config.compareFunction = __assignFunction(config.compareFunction, options.compareFunction);
        }

        /*
        * @param {Buffer[]} values
        */
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

        /*
        * @param {Buffer[]} indexes
        */
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

        /*
        * @param {Buffer} index
        * @return {any}
        */
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

        /*
        * Sort hash buffer
        */
        sort() {
            tree.leaveKeys.sort(config.compareFunction);
        }

        /*
        * @return {boolean}
        */
        getTreeStat() {
            return tree.isReady;
        }

        /*
        * @return {any{}}
        */
        getTreeLeaves() {
            return tree.leaves;
        }

        /*
        * @return {number}
        */
        getLeafCount() {
            return tree.leaveKeys.length;
        }

        /*
        * @return {Buffer[][]}
        */
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

    function __buffersRemoveItem(array, item) {
        return array.filter(buffer => !(buffer.equals(item)));
    }

    function __bufferToString(buffer, type = config.__stringType) {
        const string = (type === 'base64url')
            ? buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
            : buffer.toString(type);
        return string;
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
