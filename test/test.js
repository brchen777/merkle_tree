(() => {
    'use strict';

    const MerkleTree = require('../index.js');
    const crypto = require('crypto');
    const hashType = 'md5';

    /**
     * @param {Buffer} value
     * @return {Buffer}
     */
    let hashFunction = (value) =>  {
        value = Buffer.from(value);
        return crypto.createHash(hashType).update(value).digest();
    };

    /**
     * @param {Buffer} value1
     * @param {Buffer} value2
     * @return {1|-1|0}
     */
    let compareFunction = (value1, value2) => {
        let valStr1 = value1.toString('hex');
        let valStr2 = value2.toString('hex');

        if (valStr1 > valStr2) {
            return 1;
        }
        else if (valStr1 < valStr2) {
            return -1;
        }
        else {
            return 0;
        }
    };

    /**
     * @typedef {Object} options
     * @property {Function} [hashFunction=] Default = SHA256 hash function in crypto module
     * @property {Function} [compareFunction=] Default = Buffer.compare
     */
    /**
     * @type {options}
     */
    let options = { hashFunction, compareFunction };
    const tree = new MerkleTree(options);

    // string data
    let dataObj = {
        idx1: '1_ehxfQyRZb5',
        idx2: '2_QuytB3zXsu',
        idx3: '3_FGVLyax30g',
        idx4: '4_0rnIlkfdi8',
        idx5: '5_t0oi1UwuPP',
        idx6: '6_MPL3vyFtWM',
        idx7: '7_Gk4Py5v5ZE',
        idx8: '8_KnOAVZMvtB'
    };

    // convert string to buffer
    let dataBufferObj = {};
    Object.entries(dataObj).forEach(([key, val]) => {
        dataBufferObj[key] = Buffer.from(val);
    });
    
    // insert example
    {
        tree.insert(Object.values(dataBufferObj));
        tree.makeTree();
        let levels = tree.getTreeLevels();
        levels = levels.map(level => level.map(buf => buf.toString('hex')));

        console.log('\n--- Insert example: ---');
        console.log('* Tree structure:');
        for(let i in levels) {
            console.log(`Level ${i}: ${levels[i]}`);
        }
    }

    // find one example
    {
        let findIdx = 'idx3';
        let findHash = hashFunction(dataBufferObj[findIdx]);
        let result = tree.findOne(findHash);

        console.log('\n--- Find one example: ---');
        console.log(`* Index: ${findIdx}, Hex_Data: ${findHash.toString('hex')}`);
        console.log(`* Find result: Utf8_Data: ${result.toString('utf8')}`);
    }

    // get proof example
    {
        let proofIdx = 'idx3';
        let proofHash = hashFunction(dataBufferObj[proofIdx]);
        let result = tree.getProof(proofHash);
        result = result.map((proof) => {
            return {
                hash: proof.hash.toString('hex'),
                pos: proof.pos
            }
        });

        console.log('\n--- Get proof example: ---');
        console.log(`* Index: ${proofIdx}, Hex_Data: ${proofHash.toString('hex')}`);
        console.log('* Proof:');
        console.log(result);
    }
    
    // delete example
    {
        let delIdx = 'idx3';
        let delHash = hashFunction(dataBufferObj[delIdx]);
        tree.delete(delHash);
        tree.makeTree();
        let levels = tree.getTreeLevels();
        levels = levels.map(level => level.map(buf => buf.toString('hex')));

        console.log('\n--- Delete example: ---');
        console.log(`* Index: ${delIdx}, Hex_Data: ${delHash.toString('hex')}`);
        console.log('* Tree structure:');
        for(let i in levels) {
            console.log(`Level ${i}: ${levels[i]}`);
        }
    }

    // show root hash
    {
        console.log('\n--- Show root hash example: ---');
        console.log(`* Root hash: ${tree.rootHash.toString('hex')}`);
    }
})();