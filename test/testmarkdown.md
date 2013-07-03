​​

# JS编码规范
​​​

## 一、编辑器
 ​​

​​

1.  使用UNIX换行，即UNIX文件格式，不使用WIN或者Mac格式
2.  使用Tab缩进，不使用空格
3.  UTF-8文件保存为无BOM头的格式&nbsp;

## 二、格式

1.  大括号前不允许换行符存在
2.  语句后不得省略分号（if/for/switch/while等语句除外）
3.  字符串使用单引号，字符串中的HTML属性使用双引号
4.  单行代码不得超过100列，否则必须在运算符后面折行（折行需缩进）
5.  单个函数不得超过50行（不含空行）
6.  函数参数不得多于3个，如果有多于3个的需要，使用参数对象
7.  运算符前后以空格隔开
8.  if/else/for/while等语句必须用大括号包裹
9.  函数必须有注释，建议使用YUIDoc格式，参数注释可选​

    //CDC JavaScript编写规范示例
    function wrInCdc(){

     if(typeof cdc !== 'undefined'){  //大括号采用“悬挂式”

    		var wording = '';	//语句后加分号

    		cdc.wr = 'CDC重构 & 前端';	//字符串使用单引号
    		cdc.tmpl = 'WebRebuild';
    		cdc.wrCount = 5 + 5;	//运算符使用空格分隔

    		//if语句始终使用大括号
    		if(cdc.count >= 30){
    			wording = 'We are a big team!';
    		}else{
    			wording = 'We are a NB team!';
    		}

    	}

    }

## 三、语法

1.  所有变量先声明（使用var）后使用（包括全局变量），不允许创建隐性全局变量
2.  变量声明集中在开头，每行使用一个var
3.  不允许使用eval/new Function（json解析使用JSON.parse，低版本浏览器使用https://github.com/douglascrockford/JSON-js/blob/master/json2.js 。如果有jQuery，也可使用jQuery.parseJSON()。）
4.  不允许给setTimeout/setInterval第一个参数传递字符串（可使用function(){}代替）
5.  使用字面量创建数组、对象，不用new Array()/new Object()
6.  从构造函数（constructor）创建对象时始终使用new运算符
7.  访问对象成员时必须做存在性判断，如访问MYAPP.config.dogNum，必须使用 

    if(MYAPP && MYAPP.config && MYAPP.config.dogNum){
     //Do something with MYAPP.config.dogNum;
    }

8.  只在构造函数和对象的方法中使用this
9.  parseInt始终加上第二个参数，如parseInt(’0123′,10)
10.  提倡使用 === 和 !== ，非必要不用 == 和 !=

## 四、命名

1.  常量使用全大写，单词间以下划线隔开，如CONST_A
2.  命名空间全大写，如MYAPP
3.  构造函数（constructor）使用首字母大写的驼峰形式（camel case），如MyDog
4.  私有属性、方法以下划线开头，驼峰形式（camel case），如_getDogName()
5.  普通变量、函数、对象采用驼峰形式（camel case），如myFirstDog
6.  布尔值变量以is/can/has/should开头
7.  函数/方法名以动词或者动词短语，如getDogName()
