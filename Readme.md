# Merkle Tree #

## For user ##

### How to use ###

1. Define hash function and compare function (Optional)
    ```javascript
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
    ```

2. New a merkle tree object
    ```javascript
    /*
    Option structure:
    {
        hashFunction: undefined | function, // Default = SHA256 hash function in crypto module
        compareFunction: undefined | function  // Default = Buffer.compare
    }
    */
    const tree = new MerkleTree({ hashFunction, compareFunction });
    ```

3. Insert / delete leaf data
    ```javascript
    // insert data buffer
    const data_buffer1 = Buffer.from('Hello world!');
    tree.insert([data_buffer1, data_buffer2, ...]);

    // delete by hash buffer
    const hash_buffer1 = hashFunction('Hello world!');
    tree.delete([hash_buffer1, hash_buffer2, ...]);
    ```
4. Make tree and get tree structure
    ```javascript
    tree.makeTree();
    levels = tree.getTreeLevels();
    levels = levels.map(level => level.map(buf => buf.toString('hex')));
    for(let i in levels) {
        console.log(`Level ${i}: ${levels[i]}`);
    }

    let leaves = tree.getTreeLeaves();          // get all tree leaves data
    let leafCount = tree.getLeafCount();        // get leaf count
    let rootHash = tree.rootHash;               // get tree root hash buffer
    ```
5. Find tree leaf data
    ```javascript
    // findOne by hash buffer
    let findHash = hashFunction('Hello world!');
    let result = tree.findOne(findHash).toString('utf8');
    console.log(result);
    ```
---

## For maintainer ##

### Install project ###

* Clone project:
    > git clone \<project-url\>

* Install dependency package:
    > npm install --production

### Build and Run ###

* Run test (use node):
    > node ./test.js

* Run test (use npm):
    > npm run test
