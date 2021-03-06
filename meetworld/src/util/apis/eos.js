import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';
import * as config from '@/config';
import PriceFormatter from '../priceFormatter';
import Global from '@/Global.js';

ScatterJS.plugins(new ScatterEOS());

function getInviteCode() {
  // http://192.168.1.161:8080/?#/invite/deltaning123
  const inviteArr = window.location.hash.split('/invite/');
  return inviteArr.length === 2 ? inviteArr[1] : ''
}

// api https://get-scatter.com/docs/api-create-transaction

// @trick: use function to lazy eval Scatter eos, in order to avoid no ID problem.


const eos = () => ScatterJS.scatter.eos(config.network[Global.contractType], Eos, { expireInSeconds: 60 });
export const currentEOSAccount = () => ScatterJS.scatter.identity && ScatterJS.scatter.identity.accounts.find(x => x.blockchain === 'eos');
// 初始化currentEOSAccount
// export const currentEOSAccount = () => {
//   return {
//     name: '',
//     authority: ''
//   }
// };
console.log(currentEOSAccount());
export const api = {
  async getMyStakedInfoAsync({ accountName }) {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: accountName,
      table: 'voters',
      limit: 1024,
    });
    return rows;
  },
  async getPlayerInfoAsync({ accountName }) {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: accountName,
      table: 'players',
      limit: 1024,
    });
    return rows;
  },
  // async getLandsInfoAsync() {
  //   const { rows } = await eos().getProducerSchedule({
  //     json: true,
  //     code: 'eosio',
  //     scope: 'eosio',
  //     table: 'producers',
  //     limit: 256,
  //   });
  //   return rows;
  // },
  async getLandsInfoAsync() {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: 'cryptomeetup',
      table: 'land',
      limit: 256,
    });
    return rows;
  },
  async getPortalInfoAsync() {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: 'cryptomeetup',
      table: 'portal',
      limit: 256,
    });
    return rows;
  },
  async getGlobalInfoAsync() {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: 'cryptomeetup',
      table: 'global',
      limit: 256,
    });
    return rows;
  },
  async getMarketInfoAsync() {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: 'cryptomeetup',
      table: 'market',
      limit: 256,
    });
    return rows;
  },
  async getBalancesByContract({
    tokenContract = 'eosio.token',
    accountName,
    symbol,
    contractType
  }) {
    console.log('contractType: ', contractType);
    if (contractType === 'eos') {
      return await eos().getCurrencyBalance('dacincubator', accountName, symbol);
    } else if (contractType === 'bos') {
      return await eos().getCurrencyBalance('ncldwqxpkgav', accountName, symbol);
    }
    return await eos().getCurrencyBalance(tokenContract, accountName, symbol);
  },
  async getRefund() {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: currentEOSAccount().name,
      table: 'refunds',
      limit: 256,
    });
    return rows;
  },
  getNextPrice(land) {
    return land.price * 1.4;
  },
  install(Vue) {
    Object.defineProperties(Vue.prototype, {
      $API: {
        get() {
          return api;
        },
      },
    });
  },
  connectScatterAsync() {
    console.log('connectScatterAsync function from eos.js line 138: ', ScatterJS.scatter.connect(config.appScatterName, { initTimeout: 2000 }));
    return ScatterJS.scatter.connect(config.appScatterName, { initTimeout: 2000 });
  },
  loginScatterAsync() {
    const requiredFields = { accounts: [config.network[Global.contractType]] };
    console.log('from eos.js line 142 function loginScatterAsync: ', requiredFields);
    return ScatterJS.scatter.getIdentity(requiredFields);
  },
  logoutScatterAsync() {
    return ScatterJS.scatter.forgetIdentity();
  },
  transferEOSAsync({
    to,
    symbol,
    memo = '',
    amount = 0,
  }) {
    return eos().transfer(
      currentEOSAccount().name,
      to,
      PriceFormatter.formatPrice(amount, symbol),
      getInviteCode() ? `${memo} ${getInviteCode()}` : memo, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async transferTokenAsync({
    to,
    memo = '',
    amount = 0,
    tokenContract = 'eosio.token',
  }) {
    const contract = await eos().contract(tokenContract);

    return contract.transfer(
      currentEOSAccount().name,
      to,
      amount,
      getInviteCode() ? `${memo} ${getInviteCode()}` : memo, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async voteAsync({
    to,
    tokenContract = 'cryptomeetup',
  }) {
    const contract = await eos().contract(tokenContract);
    return contract.vote(
      currentEOSAccount().name,
      to, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async refund() {
    const contract = await eos().contract('cryptomeetup');
    await contract.refund(
      currentEOSAccount().name,
      {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async claim() {
    const contract = await eos().contract('cryptomeetup');
    await contract.claim(
      currentEOSAccount().name,
      {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async stakeCMUAsync({
    to,
    memo = '',
    amount = 0,
    tokenContract = 'cryptomeetup',
  }) {
    const contract = await eos().contract(tokenContract);
    return contract.transfer(
      currentEOSAccount().name,
      to,
      amount,
      getInviteCode() ? `${memo} ${getInviteCode()}` : memo, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async unStakeCMUAsync({
    amount = 0
  }) {
    const contract = await eos().contract('cryptomeetup');
    return contract.unstake(
      currentEOSAccount().name,
      amount,
      {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async getCheckInRedeemCodeAsync() {
    const sha256lib = await import('js-sha256');
    const token = String(Math.floor(Math.random() * 0xFFFFFF));
    return sha256lib.sha256(token).slice(0, 10);
  },
  async redeemCodeAsync({ code }) {
    if (code.length !== 10) {
      throw new Error('Invalid redeem code');
    }
    const contract = await eos().contract('cryptomeetup');
    return contract.checkin(
      currentEOSAccount().name,
      '0196d5b5d9ec1bc78ba927d2db2cb327d836f002601c77bd8c3f144a07ddc737',
      { authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`] },
    );
  },
  async getMyCheckInStatus({ accountName }) {
    const { rows } = await eos().getTableRows({
      json: true,
      code: 'cryptomeetup',
      scope: accountName,
      table: 'checkins',
      limit: 1024,
    });
    return rows;
  },
};

export default { api, currentEOSAccount };

