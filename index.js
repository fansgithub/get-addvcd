

const cheerio = require('cheerio')
const axios = require('axios');
const _ = require('lodash')
var iconv = require('iconv-lite');
const JsonToExcel = require('./json-to-excel')

async function getHtml(url) {
    const res = await axios({
        url,
        responseType: 'stream'
    })
    return new Promise(resolve => {
        const chunks = []
        res.data.on('data', chunk => {
            chunks.push(chunk)
        })
        res.data.on('end', () => {
            const buffer = Buffer.concat(chunks)
            const sourceStr = buffer.toString()
            if(sourceStr.includes('请输入验证码，以继续浏览')) return new Error('需要输入验证码')
            const str = iconv.decode(buffer, 'gb2312')
            let html = cheerio.load(str)('body > table > tbody > tr').eq(1).html()
            resolve(cheerio.load(html))
        })
    })
}

let getBaseUrl = (url) => {
    return url.split('/').slice(0, -1).join('/') + '/'
}


async function queryUrl(address, addvcds=[]){

    try {
        if(addvcds.length === 0){
            addvcds.push(address)
        }
        let $ = await getHtml(address.url);
    
    
        let domArray = $('tr td a');
        if(domArray.length !== 0){
            let _domArray = _.chunk($('tr td a'), 2);
            for(let i=0; i<_domArray.length;i++){
                let item = _domArray[i];
                let _url = getBaseUrl(address.url) + item[0].attribs.href;
                console.log(_url)
                let addvcd = item[0].children[0].data;
                let _address = {
                    addvcd,
                    addvnm: item[1].children[0].data,
                    url: _url,
                    paddvcd: address.addvcd,
                    addvlevl: address.addvlevl + 1
                }
                addvcds.push(_address)
                let concatAddvcds = await queryUrl(_address, addvcds)
                addvcds.concat(concatAddvcds)
            }
            return addvcds
        }else{
            _.chunk($('tr.villagetr td'), 3).forEach((item)=>{
                let addvcd = item[0].children[0].data;
                let _address = {
                    addvcd,
                    addvnm: item[2].children[0].data,
                    url: '',
                    paddvcd: address.addvcd,
                    addvlevl: address.addvlevl + 1
                }
                addvcds.push(_address)
            })
            return addvcds
        }
    } catch (error) {
        console.log(error)
    }

   
}




//博湖县
let address = {
    addvcd: '652829000000',
    addvnm: "博湖县",
    addvlevl: 3,
    paddvcd: '',
    url: 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/65/28/652829.html'
}

//博湖县
let address2 = {
    addvcd: '653222000000',
    addvnm: "墨玉县",
    addvlevl: 3,
    paddvcd: '',
    url: 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/65/32/653222.html'
}

//茜安
let address3 = {
    addvcd: '350981000000',
    addvnm: "福安市",
    addvlevl: 3,
    paddvcd: '',
    url: 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/35/09/350981.html'
}

//若羌县
let address4 = {
    addvcd: '652824000000',
    addvnm: "若羌县",
    addvlevl: 3,
    paddvcd: '',
    url: 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2019/65/28/652824.html'
}


// queryUrl(address).then((res)=>{
//     res = _.sortBy(res, (i)=>i.addvlevl)
//     JsonToExcel(res, ['addvcd', 'addvnm', 'addvlevl', 'paddvcd'], '博湖县行政区划')
// })

// queryUrl(address2).then((res)=>{
//     res = _.sortBy(res, (i)=>i.addvlevl)
//     JsonToExcel(res, ['addvcd', 'addvnm', 'addvlevl', 'paddvcd'], '墨玉县行政区划')
// })

queryUrl(address4).then((res)=>{
    res = _.sortBy(res, (i)=>i.addvlevl)
    JsonToExcel(res, ['addvcd', 'addvnm', 'addvlevl', 'paddvcd'], '若羌县行政区划')
})

// address3 = {
//     addvcd: '',
//     addvnm: "新疆维吾尔自治区",
//     addvlevl: 1,
//     paddvcd: '',
//     url: 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/65.html'
// }

// queryUrl(address3).then((res)=>{
//     res = _.sortBy(res, (i)=>i.addvlevl)
//     JsonToExcel(res, ['addvcd', 'addvnm', 'addvlevl', 'paddvcd'], '新疆维吾尔自治区')
// })