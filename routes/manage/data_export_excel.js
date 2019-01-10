var sql = require('../../config/dbtool');
var sqlp = require('../../libs/sql-promise');
var SqlString = require('sqlstring');
var request = require('request');
var server_settings = require('../../config/server_settings');
var excel = require('node-excel-export');

function captcha(req) {
  return new Promise(function(resolve, reject) {
    if (req.query['g-recaptcha-response'] === undefined || req.query['g-recaptcha-response'] === '' || req.query['g-recaptcha-response'] === null) {
      return reject('Recaptcha 인증에 필요한 데이터가 부족합니다.')
    }
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + server_settings.g_captcha_secret_key + "&response=" + req.query['g-recaptcha-response'] + "&remoteip=" + req.ip;
    request(verificationUrl, function(error, response, body) {
      body = JSON.parse(body);
      if (body.success !== undefined && !body.success) {
        return reject('Recaptcha 인증에 실패하였습니다.')
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = async (req, res) => {
  var {service} = req.params
  if (req.user && service == 1) {
    await captcha(req)
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
        cellStyle: (value, row) => {
          return row.status == 1 ? styles.cellGreen : styles.cellRed
        },
        width: 40
      },
      nick: {
        displayName: '닉네임',
        headerStyle: styles.headerDark,
        cellStyle: styles.cellPink,
        width: 80
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
      },
      extradata: {
        displayName: '기타데이터',
        headerStyle: styles.headerDark,
        cellStyle: styles.cellPink,
        width: 800
      }
    }

    var data = await sqlp(sql, SqlString.format("SELECT * FROM service WHERE service=1 AND owner=?", [req.user.id]))

    res.attachment('report.xlsx');
    res.send(excel.buildExport([{
      name: 'Report',
      heading: [ [{ value: 'Baw Service 후원 로그', style: styles.headerDark }] ],
      merges: [{ start: { row: 1, column: 1 }, end: { row: 1, column: 6 } }],
      specification: specification,
      data: data
    }]))

  } else {
    res.redirect('/auth/login')
  }
}
