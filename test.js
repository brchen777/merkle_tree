(() => {
    'use strict';

    const MerkleTree = require('./index.js');
    const crypto = require('crypto');
    const hashType = 'md5';

    /*
    * @param {Buffer} value
    * @return {Buffer}
    */
    let hashFunction = (value) =>  {
        value = Buffer.from(value);
        return crypto.createHash(hashType).update(value).digest();
    };

    /*
    * @param {Buffer} value1
    * @param {Buffer} value2
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

    const tree = new MerkleTree({ hashFunction, compareFunction });

    // string data
    let dataObj = {
        idx1: '111_data',
        idx2: '222_data',
        idx3: '333_data',
        idx4: '444_data'
    };

    // convert string to buffer
    let dataBufferObj = {};
    Object.entries(dataObj).forEach(([key, val]) => {
        dataBufferObj[key] = Buffer.from(val);
    });
    
    // insert example
    let levels;
    tree.insert(Object.values(dataBufferObj));
    tree.makeTree();
    levels = tree.getTreeLevels();
    levels = levels.map(level => level.map(buf => buf.toString('hex')));
    console.log('\n--- Insert example: ---');
    console.log('* Tree structure:');
    for(let i in levels) {
        console.log(`Level ${i}: ${levels[i]}`);
    }

    // find one example
    let findIdx = 'idx3';
    let findHash = hashFunction(dataBufferObj[findIdx]);
    let result = tree.findOne(findHash);
    console.log('\n--- Find one example: ---');
    console.log(`* Index: ${findIdx}, Hex_Data: ${findHash.toString('hex')}`);
    console.log(`* Find result: Utf8_Data: ${result.toString('utf8')}`);
    
    // delete example
    let delIdx = 'idx3';
    let delHash = hashFunction(dataBufferObj[delIdx]);
    tree.delete(delHash);
    tree.makeTree();
    levels = tree.getTreeLevels();
    levels = levels.map(level => level.map(buf => buf.toString('hex')));
    console.log('\n--- Delete example: ---');
    console.log(`* Index: ${delIdx}, Hex_Data: ${delHash.toString('hex')}`);
    console.log('* Tree structure:');
    for(let i in levels) {
        console.log(`Level ${i}: ${levels[i]}`);
    }

    // show root hash
    console.log('\n--- Show root hash example: ---');
    console.log(`* Root hash: ${tree.rootHash.toString('hex')}`);
})();