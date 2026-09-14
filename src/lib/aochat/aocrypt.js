const assert = require('assert');
const crypto = require('crypto');
const BN = require('bn.js');


// taken from: https://github.com/Nepherius/Darknet/blob/812e2d7ca9b22f7bbe3d72000d45c8ee60db806e/system/core/chat-packet.js

function str_repeat(str, size) {
    let r = '';
    for (let i = 0; i < size; i++) {
        r += str;
    }
    return r;
}

function fromHex(hex) {
    return new BN(hex, 16);
}

function powm(base, exponent, modulus) {
    const ar = base.toRed(BN.red(modulus))
    return ar.redPow(exponent).fromRed()
}

export function generate_login_key(serverseed, username, password) {
    let dhY = fromHex("9c32cc23d559ca90fc31be72df817d0e124769e809f936bc14360ff4bed758f260a0d596584eacbbc2b88bdd410416163e11dbf62173393fbc0c6fefb2d855f1a03dec8e9f105bbad91b3437d8eb73fe2f44159597aa4053cf788d2f9d7012fb8d7c4ce3876f7d6cd5d0c31754f4cd96166708641958de54a6def5657b9f2e92");
    let dhN = fromHex("eca2e8c85d863dcdc26a429a71a9815ad052f6139669dd659f98ae159d313d13c6bf2838e10a69b6478b64a24bd054ba8248e8fa778703b418408249440b2c1edd28853e240d8a7e49540b76d120d3b1ad2878b1b99490eb4a2a5e84caa8a91cecbdb1aa7c816e8be343246f80c637abc653b893fd91686cf8d32d6cfe5f2a6f");
    let dhG = fromHex("05");

    let dhx = new BN(crypto.pseudoRandomBytes(256 / 8));
    dhx = new BN("22460632259415353189773226830687115965565513611614348498154938376705209463028")

    let dhX = powm(dhG, dhx, dhN)
    let dhK = powm(dhY, dhx, dhN)

    let str = [username, serverseed, password].join('|');

    dhK = dhK.toString(16);

    if (dhK.length < 32) {
        while (dhK.length < 32) {
            dhK = '0' + dhK;
        }
    } else {
        dhK = dhK.substring(0, 32);
    }

    let key = fromHex(dhK).toArrayLike(Buffer)
    let prefix = crypto.pseudoRandomBytes(64 / 8);

    let length = 8 + 4 + str.length;
    let pad = Buffer.from(str_repeat(" ", (8 - length % 8) % 8));
    let strlen = Buffer.alloc(4);
    strlen.writeUInt32BE(str.length, 0);
    let plain = Buffer.concat([prefix, strlen, Buffer.from(str), pad]);

    let crypted = aochat_crypt(key, plain);

    return dhX.toString(16) + '-' + crypted.toString('hex');
}

function key_arr(key) {
    assert.equal(key.length % 4, 0);

    let a = new Array();
    for (let i = 0; i < key.length; i += 4) {
        a.push(key.readInt32LE(i));
    }
    return a;
}

function aochat_crypt(key, str) {
    assert.equal(key.length, 16); // in bytes, not in nibbles as in PHP
    assert.equal(str.length % 8, 0);

    let now = [0, 0];
    let prev = [0, 0];
    let ret = Buffer.alloc(str.length);

    let keyarr = key_arr(key);

    let dataarr = key_arr(str);

    let off = 0;

    let put = function(c) {
        ret.writeInt32LE(m(c), off);
        off += 4;
    };

    for (let i = 0; i < dataarr.length; i += 2) {

        now[0] = m(m(dataarr[i]) ^ m(prev[0]));
        now[1] = m(m(dataarr[i + 1]) ^ m(prev[1]));

        aocrypt_permute(now, keyarr, prev);

        put(prev[0]);
        put(prev[1]);
    }
    return ret;
}


function m(x) {
    return x & 0xFFFFFFFF;
}

function aocrypt_permute(cycle, key, prev) {
    assert.equal(cycle.length, 2);
    assert.equal(key.length, 4, 'key');

    let a = cycle[0];
    let b = cycle[1];
    let sum = 0;
    let delta = 0x9e3779b9;
    //let i = 32;

    for (let i = 0; i < 32; i++) {
        sum = m(sum + delta);
        a += m((b << 4 & 0xfffffff0) + key[0]) ^ m(b + sum) ^ m((b >> 5 & 0x7ffffff) + key[1]);
        b += m((a << 4 & 0xfffffff0) + key[2]) ^ m(a + sum) ^ m((a >> 5 & 0x7ffffff) + key[3]);
    }
    prev[0] = (a);
    prev[1] = (b);
}
