# 适用于 dts 的溯源懒人脚本

使用方法：

1. 按`F12`打开浏览器的开发者控制台
2. 将压缩后的代码粘贴进去敲回车
3. 打开dts的源表节点，出现弹出框后，按alt+x（或者手动输入`auto()`)
4. 网速差的耐心等待跳转到字段页面，注意，如果打印origin是空，则尝试alt+p增加延迟时间
5. alt+q可以让折起来的面板展开，展开的面板折起




# 更新历史

版本从最新到最旧

| 版本号 | 更新内容                                                     |
| ------ | ------------------------------------------------------------ |
| v8     | sql分离器的解析力增加，解决结果表的最后一行无法显示的问题，结果表的精准度增加 |
| v7     | 修复展开和折叠不一定成功的bug，无论如何都将结果打印          |
| v6     | 增加了时长可控制，按alt+p调出控制框，按alt+q切换血缘关系折叠状态，判断字段是否正确的方式改成为由字段页面取文字来对比，增加case when的解析力，兼容性更强 |
| v5     | 增加alt+x快捷键启动脚本                                      |
| v4     | 增加便于识别                                                 |
| v3     | 让全自动展开后，自动关闭，并且再次展开错误会变蓝色           |
| v2     | 增加系统判定错误与成功的颜色的功能                           |
| v1     | 全自动展开，让系统自动判断                                   |

