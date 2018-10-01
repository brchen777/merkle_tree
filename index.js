(() => {
    'use strict';

    const crypto = require('crypto');

    const defaultOptions = {
        __hashType: 'sha256',
        __stringType: 'base64url',

        /**
         * Create a hash
         * @param {Buffer} value
         * @return {Buffer}
         */
        hashFunction: function(value) {
            value = Buffer.from(value);
            return crypto.createHash(this.__hashType).update(value).digest();
        },

        /**
         * Compare hash
         */
        compareFunction: Buffer.compare
    }

    let config = defaultOptions;

    /**
     * @typedef {Object} tree
     * @property {Object<string, Buffer>} leaves <Base64url_string, Buffer>
     * @property {Buffer[]} leaveKeys Hash_buffer[ ]
     * @property {Buffer[][]} levels Hash_buffer[ ][ ]
     * @property {boolean} isReady
     */
    /**
     * @type {tree}
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

        /**
         * Insert leaves
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

        /**
         * Delete leaves
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

        /**
         * Find leaf data by data hash
         * @param {Buffer} index 
         * @return {Buffer}
         */
        findOne(value) {
            let hashStr = __bufferToString(value);
            return tree.leaves[hashStr];
        }

        /**
         * @typedef {Object} Proof
         * @property {Buffer} hash
         * @property {1|-1|0} pos 1: left, -1: right, 0: self
         */
        /**
         * Get proof by data hash
         * @param {Buffer} value
         * @return {Proof[]}
         */
        getProof(value) {
            if (!tree.isReady) return null;
            let index = __buffersIndexOf(tree.leaveKeys, value);
            if (!value || index === -1) return null;

            let proof = [];
            let levelCnt = tree.levels.length;
            for (let i = levelCnt - 1; 0 < i; i--) {
                let isRightNode = ((index % 2) === 1);
                let indexMove = (isRightNode) ? -1 : 1;
                let pos = (isRightNode) ? 1 : -1;
                
                // if this is an odd end node
                let levelNodeCnt = tree.levels[i].length;
                if ((levelNodeCnt % 2 === 1) && (index === levelNodeCnt - 1)) {
                    indexMove = 0;
                    pos = 0;
                }

                proof.push({
                    hash: tree.levels[i][(index + indexMove)],
                    pos: pos
                });

                index = Math.floor(index / 2);
            }
            return proof;
        }

        /**
         * Reset tree structure
         */
        resetTree() {
            tree = {
                leaves: {},
                leaveKeys: [],
                levels: [],
                isReady: false
            };
        }

        /**
         * Init tree structure
         */
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

        /**
         * Sort hash buffer
         */
        sort() {
            tree.leaveKeys.sort(config.compareFunction);
        }

        /**
         * Get tree stat
         * @return {boolean}
         */
        getTreeStat() {
            return tree.isReady;
        }

        /**
         * Get all tree leaves
         * @return {Object.<string, Buffer>}
         */
        getTreeLeaves() {
            return tree.leaves;
        }

        /**
         * @return {number}
         */
        getLeafCount() {
            return tree.leaveKeys.length;
        }

        /**
         * @return {Buffer[][]}
         */
        getTreeLevels() {
            return tree.levels;
        }

        /**
         * @return {''|Buffer}
         */
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

    function __buffersRemoveItem(array, value) {
        return array.filter(buffer => !(buffer.equals(value)));
    }

    function __buffersIndexOf(array, value) {
        let index = -1;
        for (let i in array) {
            if (Buffer.compare(array[i], value) === 0) {
                index = parseInt(i);
                break;
            }
        }
        return index;
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
