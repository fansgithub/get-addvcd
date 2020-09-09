const Excel = require('exceljs');

function JsonToExcel (data, keys, filename){
    /* 
        keys: ['addvcd', 'addvnm', 'addvlevel']
    */

    const start_time = new Date();
    const workbook = new Excel.stream.xlsx.WorkbookWriter({
        filename: `./${filename}.xlsx`
    });
    const worksheet = workbook.addWorksheet('Sheet');

    //如果指定keys的化，根据参数过滤
    let _keys = Object.keys(data[0]);
    if(Array.isArray(keys)){
        _keys = _keys.filter((key)=>{
            return keys.includes(key)
        })
    }
    worksheet.columns = _keys.map((item)=>{
        return {
            header: item,
            key: item
        }
    })
    var length = data.length;

    // 当前进度
    var current_num = 0;
    var time_monit = 400;
    var temp_time = Date.now();

    console.log('开始添加数据');
    // 开始添加数据
    for(let i in data) {
        worksheet.addRow(data[i]).commit();
        current_num = i;
        if(Date.now() - temp_time > time_monit) {
            temp_time = Date.now();
            console.log((current_num / length * 100).toFixed(2) + '%');
        }
    }
    console.log('添加数据完毕：', (Date.now() - start_time));
    workbook.commit();
    var end_time = new Date();
    var duration = end_time - start_time;
    console.log('用时：' + duration);
    console.log("程序执行完毕");
}


module.exports = JsonToExcel