var sql = require('../../config/dbtool');
var SqlString = require('sqlstring');
var request = require('request');
var server_settings = require('../../config/server_settings');

function captcha(req){
  return new Promise(function (resolve, reject) {
    if(req.query['g-recaptcha-response'] === undefined || req.query['g-recaptcha-response'] === '' || req.query['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.query['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function(error,response,body) {
      body = JSON.parse(body);
      if(body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      }
    })
    resolve(true)
  })
}

module.exports = function (req, res) {
    if(req.user) {
      captcha(req, res).then(function (text) {
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
            },
            cellRed: {
              fill: {
                fgColor: {
                  rgb: 'FFFF0000'
                }
              }
            }
          };
          const heading = [
            [{value: 'Baw Service 후원 로그', style: styles.headerDark}]
          ];
          const specification = {
            num: {
              displayName: '번호',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 40
            },
            status: {
              displayName: '상태',
              headerStyle: styles.headerDark,
              cellStyle: function(value, row) {
                if(row.status == 1) { return styles.cellGreen } else { return styles.cellRed }
              },
              width: 40
            },
            pin: {
              displayName: '핀번호',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 220
            },
            bal: {
              displayName: '금액',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 100
            },
            method: {
              displayName: '후원 방법',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 100
            },
            code: {
              displayName: '발행일(인증번호)',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 100
            },
            nname: {
              displayName: '입금자명',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 100
            },
            bouns: {
              displayName: '후원 보너스',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 220
            },
            ip: {
              displayName: 'IP',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 150
            },
            date: {
              displayName: '날짜',
              headerStyle: styles.headerDark,
              cellStyle: styles.cellPink,
              width: 100
            }
          }
          const merges = [
            { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } }
          ]

          var query=sql.query("select * from service1 where owner="+SqlString.escape(req.user.id), function(err,rows){
            if(err){ throw new Error('1번 질의 오류') }
            const report = excel.buildExport(
              [
                {
                  name: 'Report',
                  heading: heading,
                  merges: merges,
                  specification: specification,
                  data: rows
                }
              ]
            );
            res.attachment('report.xlsx');
            res.send(report);
            console.log('gd')
          });
        } else if(req.params.service == 2) {
          // TODO: 정품인증 데이터 내보내기
        } else {
          res.render('error/403')
        }
      }).catch(function (error) {
      	res.json({ success: false, message: error })
      });
    } else {
      res.redirect('/auth/login')
    }
};
