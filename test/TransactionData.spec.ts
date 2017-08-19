import getWavesAPI from '../src/WavesAPI';
import { expect } from './_helpers/getChai';
import { deterministicSignData } from './_helpers/deterministicSignData';
import crypto from '../src/utils/crypto';
import { DEFAULT_TESTNET_CONFIG } from '../src/constants';
import base58 from '../src/libs/base58';
import config from '../src/config';


function checkBasicCases(preparedData, data, txType, expectedSignature) {

    expect(preparedData.transactionType).to.equal(txType);
    expect(preparedData.signature).to.equal(expectedSignature);

    const newKeys = Object.keys(preparedData).sort();
    const stableKeys = ['transactionType', ...Object.keys(data), 'signature'].sort();
    expect(newKeys).to.deep.equal(stableKeys);

}


const waves = getWavesAPI(DEFAULT_TESTNET_CONFIG);

const {
    TransferData,
    IssueData,
    ReissueData,
    CreateAliasData
} = waves.TransactionData;

const keys = {
    publicKey: 'FJuErRxhV9JaFUwcYLabFK5ENvDRfyJbRz8FeVfYpBLn',
    privateKey: '9dXhQYWZ5468TRhksJqpGT6nUySENxXi9nsCZH9AefD1'
};

const transferDataJson = {
    publicKey: keys.publicKey,
    recipient: '3N9UuGeWuDt9NfWbC5oEACHyRoeEMApXAeq',
    assetId: '246d8u9gBJqUXK1VhQBxPMLL4iiFLdc4iopFyAkqU5HN',
    amount: 1000,
    feeAssetId: 'WAVES',
    fee: 100000,
    attachment: '',
    timestamp: 1478864678621
};

const issueDataJson = {
    publicKey: keys.publicKey,
    name: 'БАБЛОС',
    description: 'Some english words немного кириллических символов',
    quantity: 10000000000,
    precision: 2,
    reissuable: true,
    fee: 100000000,
    timestamp: 1478704158292
};

const reissueDataJson = {
    publicKey: keys.publicKey,
    assetId: '246d8u9gBJqUXK1VhQBxPMLL4iiFLdc4iopFyAkqU5HN',
    quantity: 100000000,
    reissuable: false,
    fee: 100000000,
    timestamp: 1478868177862
};

const createAliasDataJson = {
    publicKey: keys.publicKey,
    alias: 'sasha',
    fee: 1000000,
    timestamp: 1491556329420
};


describe('TransactionData', function () {

    let tempSignData;

    beforeEach(() => {
        tempSignData = crypto.buildTransactionSignature;
        crypto.buildTransactionSignature = deterministicSignData;
    });

    afterEach(() => {
        crypto.buildTransactionSignature = tempSignData;
    });

    it('should sign Transfer transaction', function (done) {

        const data = transferDataJson;

        const transferData = new TransferData(data);

        const expectedSignature = '677UVgKBAVZdweVbn6wKhPLP9UxVSh3x4fBXPgepKoHtsV9nSd8HXBMxCdsYn41g3EE63bcihnUHwhXoSu9GZTLf';

        const api = transferData.prepareForAPI(keys.privateKey).then((preparedData) => {
            checkBasicCases(preparedData, data, 'transfer', expectedSignature);
            expect(preparedData.recipient).to.equal('address:' + data.recipient);
        });

        Promise.all([api]).then(() => done());

    });

    it('should sign Transfer transaction with alias', function (done) {

        const alias = 'sasha';
        const data = { ...transferDataJson, recipient: alias };

        const transferData = new TransferData(data);

        const expectedSignature = '2XJAHpRXx12AvdwcDF2HMpTDxffKkmN9qK7r3jZaVExYVjDaciRszymkGXy5QZExz6McYwDf6gicD4XZswJGKAZW';

        const api = transferData.prepareForAPI(keys.privateKey).then((preparedData) => {
            checkBasicCases(preparedData, data, 'transfer', expectedSignature);
            expect(preparedData.recipient).to.equal('alias:' + String.fromCharCode(config.getNetworkByte()) + ':' + data.recipient);
        });

        Promise.all([api]).then(() => done());

    });

    it('should sign Transfer transaction with attachment', function (done) {

        const attachment = '123';
        const attachmentBytesWithLength = [0, 3, 49, 50, 51];
        const data = { ...transferDataJson, attachment };

        const transferData = new TransferData(data);

        const expectedSignature = 'TrgV7V7meddPs7aU9ZemrCXNVQ8h35cERTBNfvbtVqURbgRS1fnEmzELMAxvqeYrHF6sYiJJ4oc3v4tEZQbn5qD';

        const api = transferData.prepareForAPI(keys.privateKey).then((preparedData) => {
            checkBasicCases(preparedData, data, 'transfer', expectedSignature);
            expect(preparedData.attachment).to.equal(base58.encode(attachmentBytesWithLength));
        });

        Promise.all([api]).then(() => done());

    });

    it('should sign Issue transaction', function (done) {

        const data = { ...issueDataJson };

        const issueData = new IssueData(data);

        const expectedSignature = '5ngquur4nqX1cVPK3Zaf9KqY1qNH6i7gF5EhaWeS8mZp1LADTVuPXmNUi12jeXSniGry5a7ThsMtWcC73pSU196o';

        const api = issueData.prepareForAPI(keys.privateKey).then((preparedData) => {
            checkBasicCases(preparedData, data, 'issue', expectedSignature);
        });

        Promise.all([api]).then(() => done());

    });

    it('should sign Reissue transaction', function (done) {

        const data = { ...reissueDataJson };

        const reissueData = new ReissueData(data);

        const expectedSignature = '4G81NzgHDwXdjqANGE2qxZrC5VpDA7ek3Db8v3iqunpkrXgAy7KBJgdHWUw1TEDBNewtjMJTvB9Po55PZ5d6ztCk';

        const api = reissueData.prepareForAPI(keys.privateKey).then((preparedData) => {
            checkBasicCases(preparedData, data, 'reissue', expectedSignature);
        });

        Promise.all([api]).then(() => done());

    });

    it('should sign Create Alias transaction', function (done) {

        const data = createAliasDataJson;

        const createAliasData = new CreateAliasData(data);

        const expectedSignature = '2fDkcUaPrQjtL1Tfox1ikqfZWA7LkvWKrGZNaxJx98dmeLoopkwvAFa9nMJLww9PERGuQovfv8g9EPM6HkV5VPaH';

        const api = createAliasData.prepareForAPI(keys.privateKey).then((preparedData) => {
            checkBasicCases(preparedData, data, 'createAlias', expectedSignature);
        });

        const signature = createAliasData.getSignature(keys.privateKey).then((signature) => {
            expect(signature).to.equal(expectedSignature);
        });

        const bytesByName = createAliasData.getExactBytes('publicKey').then((bytes) => {
            expect(bytes).to.deep.equal(base58.decode(data.publicKey));
        });

        // Should throw when bytes of a non-existing field are requested
        expect(() => createAliasData.getExactBytes('test')).to.throw();

        Promise.all([api, signature, bytesByName]).then(() => done());

    });

});