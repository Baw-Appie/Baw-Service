var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
module.exports = function (req, res) {
    if(req.user) {
      if(req.params.service == 1) {
        const excel = require('node-excel-export');
        const styles = {
          headerDark: {
            fill: {
              fgColor: {
                rgb: 'FF000000'
              }
            },
            font: {
              color: {
                rgb: 'FFFFFFFF'
              },
              sz: 14,
              bold: true,
              underline: true
            }
          },
          cellPink: {
            fill: {
              fgColor: {
                rgb: 'FFFFCCFF'
              }
            }
          },
          cellGreen: {
            fill: {
              fgColor: {
                rgb: 'FF00FF00'
              }
            }
          }
        };
        const heading = [
          [{value: 'Baw Service 후원 로그', style: styles.headerDark}]
        ];
        const specification = {
          customer_name: {
            displayName: 'Customer',
            headerStyle: styles.headerDark,
            cellStyle: function(value, row) {
              return (row.status_id == 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}};
            },
            width: 120
          },
          status_id: {
            displayName: 'Status',
            headerStyle: styles.headerDark,
            cellFormat: function(value, row) {
              return (value == 1) ? 'Active' : 'Inactive';
            },
            width: '10'
          },
          note: {
            displayName: 'Description',
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink,
            width: 220
          }
        }

        // The data set should have the following shape (Array of Objects)
        // The order of the keys is irrelevant, it is also irrelevant if the
        // dataset contains more fields as the report is build based on the
        // specification provided above. But you should have all the fields
        // that are listed in the report specification
        const dataset = [
          {customer_name: 'IBM', status_id: 1, note: 'some note', misc: 'not shown'},
          {customer_name: 'HP', status_id: 0, note: 'some note'},
          {customer_name: 'MS', status_id: 0, note: 'some note', misc: 'not shown'}
        ]
        // The data set should have the following shape (Array of Objects)

        // Define an array of merges. 1-1 = A:1
        // The merges are independent of the data.
        // A merge will overwrite all data _not_ in the top-left cell.
        const merges = [
          { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
          { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
          { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
        ]

        // Create the excel report.
        // This function will return Buffer
        const report = excel.buildExport(
          [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
            {
              name: 'Report', // <- Specify sheet name (optional)
              heading: heading, // <- Raw heading array (optional)
              merges: merges, // <- Merge cell ranges
              specification: specification, // <- Report specification
              data: dataset // <-- Report data
            }
          ]
        );

        // You can then return this straight
        res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
        res.send(report);
        // var nodeExcel=require('excel-export');
        // var conf={}
        // conf.cols=[
        //   {
        //     caption:'등록 번호',
        //     type:'number'
        //   },
        //   {
        //     caption:'닉네임',
        //     type:'string'
        //   },
        //   {
        //     caption:'후원 금액',
        //     type:'string'
        //   },
        //   {
        //     caption:'핀번호',
        //     type:'string'
        //   },
        //   {
        //     caption:'후원 방법',
        //     type:'string'
        //   },
        //   {
        //     caption:'발행일(인증번호)',
        //     type:'string'
        //   },
        //   {
        //     caption:'입금자명',
        //     type:'string'
        //   },
        //   {
        //     caption:'후원 보너스',
        //     type:'string'
        //   },
        //   {
        //     caption:'IP',
        //     type:'string'
        //   },
        //   {
        //     caption:'날짜',
        //     type:'string'
        //   },
        //   {
        //     caption:'처리 상태',
        //     type:'string'
        //   }
        // ];
        // var query=sql.query("select * from service1 where owner="+SqlString.escape(req.user.id), function(err,rows){
        //   if(err){ throw new Error('1번 질의 오류') }
        //   arr=[];
        //   for(i=0;i<rows.length;i++){
        //     a=[rows[i]['num'], rows[i]['nick'], rows[i]['bal'], rows[i]['pin'], rows[i]['method'], rows[i]['code'], rows[i]['nname'], rows[i]['bouns'], rows[i]['ip'], rows[i]['date'], rows[i]['status']];
        //     arr.push(a);
        //   }
        //   conf.rows=arr;
        //   console.log(conf)
        //   var result=nodeExcel.execute(conf);
        //   res.setHeader('Content-Type','application/vnd.openxmlformates');
        //   res.setHeader("Content-Disposition","attachment;filename="+"Powered by Baw Service.xlsx");
        //   res.end(result,'binary');
        // });
      } else if(req.params.service == 2) {
        // TODO: 정품인증 데이터 내보내기
      } else {
        res.render('error/403')
      }
    } else {
      res.redirect('/auth/login')
    }
};
