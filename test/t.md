#CSS编写

1.  CSS编码必须使用uft-8编码保存，并在头部声明 @charset "utf-8";
2.  必须使用业务统一的CSS REST保持各浏览器表现基本统一(请用 [reset.css 生成工具](http://demo.cdc.im/tools/reset/)&nbsp;按需生成业务reset代码）；
3.  CSS选择符使用class，尽可能避免选择符直接使用 HTML标签或通配符；
4.  模块化编写，前期规划好通用模块并考虑重用性可能造成的瓶颈，同时在注释中书写关注点及使用方法，后期维护尽可能复用之前CSS片段和HTML片段；
5.  通用模块样式，类命名统一使用 mod_ 开头，如：.mod_desc.mod_list
6.  使用代码格式和注释来保证CSS的可读性和易维护性，属性「properties」和属性的取值「value」竖排书写，选择符「selector」换行书写，每个类名间的","「逗号」后必须换行；
7.  CSS HACK使用标准形式放置于紧跟相同属性后面，并加以注释；
8.  模块布局建议使用display:inline-block、float、position等方法，尽量避免position:relative; 给项目造成的影响，使用前须评估。
9.  样式表中 font-family 采用小写，如 tahoma, aria；中文字体名，请务必书写为其英文名，如 simsun, microsoft yahei；
10.  杜绝使用&lt;meta http-equiv="X-UA-Compatible" content="IE=7" /&gt; 兼容ie8;
11.  属性值统一不加引号;
12.  Margin，padding，border等属性可以简写的尽量简写，后续修改维护时，只需要改动单边属性值即可。
13.  常用IE&nbsp;HACK:

        /**IE HACK 开始**/
        .ie{
        _color:#f00;/**ie6**/
        *color:#000;/**ie6 ie7**/
        color:#0f0\0; /**ie8 ie9**/
        color:#00f\9; /**all ie**/
        color:#ff0\0/;/**ie8**/
        }
        :root .ie{
        color:#ffc\0; /**ie9**/
        }
        :root .ie{
        color:#ffc; /**所有支持CSS3的浏览器**/
        }
        /**IE HACK 结束**/:
14. fdsafdsdsfa
