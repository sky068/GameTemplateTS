# -*- coding: utf-8 -*-

'''
修改main.js和index.html的相应位置，添加cdn地址
把文件部署到相应位置
'''
import os
import re
import sys
import re
import shutil
from getopt import getopt

def work(argv):
    helpstr = 'use auto_cdn.py -r remote_url'
    try:
        opts, args = getopt(argv[1:], "r:h", ["help"])
    except getopt.GetoptError:
        print("Error: %s" % helpstr)
    for opt, arg in opts:
        if opt in ("-r"):
            remote = arg
        elif opt in ("-h", "--help"):
            print(helpstr)
            exit()
    if not remote:
        print('无效的cdn_url: %s' % remote)
        return
    if len(remote) > 0 and not remote.endswith('/'):
        remote = remote + "/"
    print("remote_url=%s" % remote)
    # 当前脚本所在目录
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    # build目录
    PROJ_DIR = os.path.join(CURRENT_DIR, '..','build','web-mobile')

    #查找main.xxx.js文件
    files = os.listdir(PROJ_DIR)
    for file in files:
        if 'main' in file and file.endswith('.js'):
            mainjs_path = os.path.join(PROJ_DIR, file)
            break
    if os.path.exists(mainjs_path):
        print('开始修改%s' % mainjs_path)
        with open(mainjs_path, 'r') as oriMain, open(mainjs_path+'.tmp', 'w') as newMain:
            pattern = re.compile(r'REMO')
            pattern2 = re.compile(r'res/import')
            pattern3 = re.compile(r'res/raw-')
            line = oriMain.readline()
            while line:
                # # 替换src
                # if line.find('require') < 0:
                #     line = re.sub(pattern, remote + pattern.pattern, line)
                # # 替换res/import
                # if line.find('res/import') >= 0:
                #     line = re.sub(pattern2, remote + pattern2.pattern, line)
                # # 替换res/raw-
                # if line.find('res/raw-') >= 0:
                #     line = re.sub(pattern3, remote + pattern3.pattern, line)
                line = re.sub(r"REMOTE_URL = ''", "REMOTE_URL = " + "'" + remote + "'", line)
                newMain.write(line)
                line = oriMain.readline()
        os.remove(mainjs_path)
        os.rename(mainjs_path + '.tmp', mainjs_path)
        print('修改完成')

    # index.html没有md5值，可以直接找到进行修改
    index_path = os.path.join(PROJ_DIR, 'index.html')
    if os.path.exists(index_path):
        print('开始修改%s' % index_path)
        with open(index_path, 'r') as oriIndex, open(index_path+'.tmp', 'w') as newIndex:
            # partern = re.compile(r'style-mobile')
            # partern2 = re.compile(r'src/settings')
            # partern3 = re.compile(r'main.')
            # partern4 = re.compile(r'cocos2d-js')
            patterns = [re.compile(r'style-mobile'), re.compile(r'src/settings'), re.compile(r'main.'), re.compile(r'cocos2d-js'), re.compile(r'physics')]
            line = oriIndex.readline()
            while line:
                for pattern in patterns:
                    line = re.sub(pattern, remote + pattern.pattern, line)

                newIndex.write(line)
                line = oriIndex.readline()

        os.remove(index_path)
        os.rename(index_path + '.tmp', index_path)
        print('修改完成')

if __name__ == '__main__':
    work(sys.argv)
