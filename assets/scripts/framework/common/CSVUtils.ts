/**
 * Created by xujiawei on 2020-07-08 11:30:11
 */

import { CSVParser, CSV } from './CSVParser';

export let CSVUtils = {
    /**
     * @return String[][]
     * DefaultOptions: {
            delim: ',',
            quote: '"',
            rowdelim: '\n'
            // rowdelim: '\r\n'
        }
    */
    parse: function (str, options) {
        let parser = new CSVParser(str, options);
        let all = [];
        while (parser.hasNext()) {
            let ar = parser.nextRow();
            all.push(ar);
        }
        return all;
    },

    parseOneLine: function (str, options) {
        let parser = new CSVParser(str, options);
        let all = [];
        while (parser.hasNext()) {
            let ar = parser.nextRow();
            all.push(ar);
        }
        if (all.length <= 1) {
            return all[0];
        }
        return all;
    },

    /**
     * @param rows String[][]
     * @param colnames String[]
     * @param {Boolean} isParseNumber 是否需要解析成相应的数字
     * @return Object[]
     */
    bindColumns: function (rows, colnames, isParseNumber) {
        if (!colnames) {
            colnames = rows.shift();
        }
        return rows.map(function (row) {
            let obj = {};
            for (let i = 0; i < row.length; i++) {
                if (isParseNumber) {
                    obj[colnames[i]] = (isNaN(row[i]) ? row[i] : Number(row[i]));
                } else {
                    obj[colnames[i]] = row[i];
                }
            }
            return obj;
        });
    },

    bindColumnsSimple: function (rows, colnames) {
        if (!colnames) {
            colnames = rows.shift();
        }
        return rows.map(function (row) {
            let obj = {};
            for (let i = 0; i < row.length; i++) {
                obj[colnames[i]] = CSV.parseOneSimple(row[i]);
            }
            return obj;
        });
    }
}