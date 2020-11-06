export const task = {
    name: '进入商店',
    debug: true,
    autorun: false,
    steps: [
        {
            desc: '文本提示',
            command: { cmd: 'text', args: ['测试新手引导框架\n', '首先，请点击建造按钮'] },
        },

        {
            desc: '点击建造按钮',
            command: { cmd: 'finger', args: 'mainUI > mainMenu > menuLayout > build' },
        },

        {
            desc: '文本提示',
            command: { cmd: 'text', args: '选择一个地块进行创建' }
        },

        {
            desc: '点击地块开始创建',
            command: { cmd: 'finger', args: 'FarmMap > mapScrollView > content > map > building > BuildTool3001' },
            delayTime: 0.5,
        },

        {
            desc: '文本提示',
            command: { cmd: 'text', args: '选择一个建筑开始创建' }
        },

        {
            desc: '选择一个建筑',
            command: { cmd: 'finger', args: 'BuildingBuildPop > root > bg > listView > content > BuildingItem0' },
            delayTime: 0.8,
        },

        {
            desc: '建造',
            command: { cmd: 'finger', args: 'BuildingBuildPop > root > bg > build' },
            delayTime: 0.1,

            onEnd(callback) {
                cc.director.on('task_build_finish', ()=>{
                    callback();
                });
            },
        },

        {
            desc: '点击退出建造',
            command: { cmd: 'finger', args: 'mainUI > TopBar > exit' },
            delayTime: 0.1,
            // onStart(callback) {
            //     setTimeout(() => {
            //         cc.log('模拟异步提交数据');
            //         callback();
            //     }, 1000);
            // },
        },

        {
            desc: '文本提示',
            command: { cmd: 'text', args: '太好了，你创建好了一个建筑, 下面看下换装吧！' }
        },

        {
            desc: '点击换装按钮',
            command: { cmd: 'finger', args: 'mainUI > mainMenu > menuLayout > dress' },
            delayTime: 1,
            // onStart(callback) {
            //     setTimeout(() => {
            //         cc.log('模拟异步提交数据');
            //         callback();
            //     }, 1000);
            // },
        }
    ]
}