var plugin = {
    ztree:{
        path:'ztree/ztree.js',
        depending:['ztree/ztree.css']
    },
    echarts:{
        path:'echarts/echarts.js'
    },
    layui:'layui/layui.all.js',
    countup:'jquery-countup/jquery.countUp.js',
    vue:'vue/vue.js',
    bootstrap:{
        path:'bootstrap/bootstrap.min.js',
        depending:['bootstrap/bootstrap.css']
    },
    validator:{
        path:'bootstrap-validator/bootstrapValidator.js',
        depending:['bootstrap/bootstrap.css','bootstrap-validator/validate.css']
    },
    'jquery-validate':{
        path:'jquery-validator/jquery.validate.js'
    }
};


/* @group 针对IE做的兼容 */
if(!Array.prototype.indexOf){
    Array.prototype.indexOf = function(n){
        for(var i=0;i<this.length;i++){
            if(n===this[i]){
                return i;
            }
        }
        return -1;
    };
}
if(!Array.prototype.forEach){
    Array.prototype.forEach = function(callback,thisArg){
        var T,k;
        if(this == null) throw new TypeError('this is null or not defined');

        var O = Object(this);
        var len = O.length >>> 0;
        if(typeof callback !== 'function'){
            throw new TypeError(callback+' is not a function');
        }
        if(arguments.length > 1){
            T = thisArg;
        }
        k=0;
        while(k<len){
            var kValue;
            if(k in O){
                kValue = O[k];
                callback.call(T,kValue,k,O);
            }
            k++;
        }
    }
}
if(!Array.isArray){
    Array.isArray = function(arg){
        return Object.prototype.toString.call(arg) === '[object Array]';
    }
}
/* @end 针对IE做的兼容*/

var checkExistTag = function(src,tagName){
    /*针对IE8 document.head undefined问题*/
    if(document.head==undefined){document.head = document.getElementsByTagName('head')[0];}

    var tags=document.head.getElementsByTagName(tagName||'script');
    src=src.replace(/\\/g,'/').replace(/\.{1,3}\//g,'');
    // src.has('moment') && console.warn(src);
    for(var i=0;i<tags.length;i++){
        //info([tags[i].href,tags[i].src])
        var a=(tagName=='link'?tags[i].href:tags[i].src).split('').reverse().join('');
        var b=src.split('').reverse().join('');
        //src.has('moment') && console.info(a.split('').reverse().join('')+'::'+b.split('').reverse().join(''))
        if(a.indexOf(b)==0){
            // console.log('!!!skip!!!');
            return tags[i];
        }
    }
    return false;
};
var $style = function(src,cb){
    if(typeof arguments[1]==='string'){
        var styleId='style4-'+ ( arguments[1] || (''+Math.random()).replace('.','').slice(0,-9) );//取不好名字,可以传入空字符串随机生成id,单这样重复调用无法自动识别
        if(window[styleId]){return window[styleId];}
        var styleTxt= arguments[0].trim();
        var styleTag= styleTxt[0]==='<' ? $(styleTxt).prop('id',styleId) : $('<style id="{1}">{0}</style>'.format(styleTxt,styleId));
        return styleTag.appendTo(document.head);
    }
    //src.match(/^http|^\.|^\//)!=null || (src=top.path+'/style/'+src);
    src.match(/\.css$/i)!=null || (src+='.css');
    //src+='?version='+Date.format('YYYYMMDD').slice(0,-1);
    var exist=checkExistTag(src,'link');
    if(exist){
        return typeof cb=='function'?cb():false;
    }else {
        exist && document.head.removeChild(exist);
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.media = "screen";
        link.href = src;
        document.head.appendChild(link);
        cb && cb.call(link);
        return link;
    }
};
var $script = function(src,cb){
    var bol=false;
    var tag=document.createElement("script");
    var exist=checkExistTag(src);
    // console.warn('     '+src,redoExist);
    if(exist){
        // src.has('moment') && console.log('     '+src);
        $(exist).on('load',function(){
            // log('load!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            cb && cb();
        });
        return exist;
    }else{
        exist && document.head.removeChild(exist);
        tag.type="text/javascript";
        tag.language="javascript";
        //tag.setAttribute('async','async');
        //tag.setAttribute('defer','defer');
        src.match(/\.js$/i)!=null || (src+='.js');
        tag.src=src;
        tag.onload=tag.onreadystatechange=function(){
            if(!bol&&(!tag.readyState||tag.readyState=="loaded"||tag.readyState=="complete")){
                bol=true;
                tag.onload=tag.onreadystatechange=null;
                if(cb){
                    cb();
                }
            }
        };
        document.head.appendChild(tag);
        return tag;
    }
};

var global = {
    $style:$style,
    $script:$script
};
var importing = function(){
    var ags = arguments;
    var ag = ags[0];
    var the = this;

    console.info(ags);

    if(ags.length===0){
        console.warn('缺失importing的function......');
        return false;
    }

    if(typeof ag === 'function'){
        console.info('调用importing的function......');
        return ag();
    }

    var plugins = plugin;
    if(plugins[ag]){
        if(typeof plugins[ag] === 'object'){
            //并入依赖项
            var _ags = (plugins[ag].depending || []).concat(plugins[ag].path?plugins[ag].path:[]);
            return importing.apply(the,_ags.concat([].slice.call(ags,1)));
        }
        else{
            // 'plugin/ckeditor/ckeditor.js' or '../plugin/ckeditor/ckeditor.js'
            ag = (function(src){
                var _resPath = '';
                var _str = location.pathname;

                var _i = _str.indexOf('/view/');
                var _k = '';
                if(_i>-1){
                    for(_i=_i+5;_i<_str.length;_i++){
                        (_str[_i]=='/') && (_k+='../');
                    }
                }

                _resPath = _k+src;

                return _resPath;
            })('plugin/'+plugins[ag]);

        }
    }
    else{

        var _str = location.pathname;

        var _i = _str.indexOf('/view/');
        var _k = '';
        if(_i>-1){
            for(_i=_i+5;_i<_str.length;_i++){
                (_str[_i]=='/') && (_k+='../');
            }
        }
        ag = _k+'plugin/'+ag;
        // ag = location.pathname.indexOf('/view/')>-1?'../plugin/'+ag:'plugin/'+ag;
    }

    global[ag.match(/.*\/css\/.+|.css$/i)?'$style':'$script'](ag,function(){
        importing.apply(the,[].slice.call(ags,1));
    });
};

var queryParse = function (e){

    var f = new RegExp("[?&][^?&]+=[^?&]*","g");

    function d(e) {
        var t = "";
        for (var n in e) t += "&" + n + "=" + e[n];
        return t.slice(1)
    }

    function u(e) {
        var t, n, i, o, a = Object.create ? Object.create(null) : {};
        if ("?" === e[0] || "&" === e[0] || (e = "?" + e), null === (t = e.match(f))) ; else for (n = t.length, o = 0; o < n; o++) i = t[o].slice(1).split("="), a[i[0]] = i[1];
        return a
    }

    if(0===arguments.length){
        if("undefined"==typeof window)
            throw new Error("type error:window is undefined, need one arg at least!");
        return u($.trim(window.location.search||""))
    }
    if(null==e)
        return Object.create?Object.create(null):{};
    if("string"==typeof e)
        return u(e);
    if("object"==typeof e)
        return d(e);
    throw new Error("type error:the arg neither object nor string!")
};

var obj2str = function(obj){return typeof obj=='object'?JSON.stringify(obj):obj;};
var str2obj = function(str,b){
    var obj;
    if(typeof str=='string'){
        obj=b?eval('('+str+')'):JSON.parse(str);
    }else{
        obj=str;
    }
    return obj;
};

//空值及转义处理 for null,undefined,number,xss and others
function $encode(val,allowHTML,zeroAsEmpty,tranSymbol){
    var dic={
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot',
        "'":'&#39',//‘ &apos
        ':':'&#58',//：
        '{':'&#123;',
        '}':'&#125;'};

    // 数字0会做false,false做‘’处理(字符串'0'不会),需要显示0或不做为false条件则需要{i.toString}转为字符串形式
    if(val==null || val=='null' || val=='NULL' || (!zeroAsEmpty && val===0) || val===false ){
        return '';
    }

    //默认转义HTML
    if(allowHTML){
        val=String(val).replace(/\<\/?script[^\>]*\>/gmi,function(s){return s.replace(/\<|\>/gm,function($){return dic[$]})});
    }
    else{
        val=String(val).replace(/\<|\>/gm,function($){return dic[$]});
    }

    //后台没做转义才开启，避免性能消耗
    if(tranSymbol){
        val=val.replace(/\"\'\{\}\:/gm,function($){return dic[$];});
    }

    return val;
}
//单个属性值解析器
function $getVal(key,obj,allowHTML,$index){
    var invert=key[0]==='!';
    key=key.replace('!','');
    var val=obj;
    var arr=key.split('.');
    var the=this;
    for(var i=0;i<arr.length;i++){
        //对第一个属性判断
        if(i==0 ){
            //this一般是绑定的固定数据,如果是this则指向代入的this, 直接赋值走向下个属性
            if(arr[i]=='this'){
                val=the;
                continue;
            }
            //只有数组在调用中会传入$index
            if(typeof $index!='undefined'){
                //如果是$index或$rownum就直接代入索引和序号
                if(arr[i]==='$index' || arr[i]==='_index'){
                    val=$index;
                    continue;
                }
                if(arr[i]=='$rownum' || arr[i]==='_rownum'){
                    val=$index+1;
                    continue;
                }
                if(arr[i]=='$nth' || arr[i]==='_nth'){
                    val =  $index%2==1 ? 'nth-even':'nth-odd';
                    $index%3==2  && (val += ' nth-third');
                    continue;
                }
            }
        }
        //数字的length是数字本身,而非数字字符串长度. i=0,k=5; i.length为0,返回空值, k.length返回5, 这样的设计是让空值的length属性也为空, 取id.length属性时,不管id是number还是string都可用于真假值判断
        if(typeof val=='number' && arr[i]=='length'){
            //val=val;
        }
        //函数属性取返回值
        else{
            if(typeof val[arr[i]]=='function'){
                val=val[arr[i]].toString().indexOf('[native code]')>-1?val[arr[i]]():val[arr[i]].call(val,obj,$index);
            }else{
                val=val[arr[i]];
            }
        }
        //过滤特殊字符,数据库或js类型转换的典型结果, 实际预期是空字符串
        if((val==null||val=='null' || val=='NULL') && typeof arr[i+1]!='undefined'){
            val='';
        }
        //console.info('一次循环结束\n\n  ')
    }
    val=invert?!val:val;
    return typeof arguments[2]=='function' ? arguments[2](val):$encode(val,allowHTML);
}
//单个对象值编译器 core 4 core
function $format(str,obj,allowHTML,$index){
    //console.log(['进入format',str,obj])
    var the=this;

    var getVal=function(key,fn){
        return $getVal.call(the,key,obj,fn?fn:allowHTML,$index);
    };

    if(str.isEmpty()){
        return str;
    }
    //
    //var patt=/{{ \s* \!? \w+ \s* &{0,2} \:? \s* \n/g;
    //var result;
    //
    //while ((result = patt.exec(str)) != null)  {
    //    patt.lastIndex;
    //}

    //条件或循环表达式{{....}}  这里有个小隐坑,页面中的html模版取出时,&会被转义,因此解析表达式时需要转回来
    str=str.replace(/&amp;&amp;/g,'&&');


    //将换行表达式的结尾整理下
    str=str.replace(/\n\s*}}\s*\n/g,'\n}}\n');


    //利用split按顺序拆分, 避免正则贪婪匹配
    var strArr=str.split('\n}}\n');

    //没有换行表达式
    if(strArr.length===1){
        //啥也不做
    }
    //只有一个换行表达式
    else if(strArr[strArr.length-1]===''){
        //也不做
    }
    //多个换行表达式
    else{
        //console.log(['准备做换行表达式解析',str]);
        str='';
        strArr.forEach(function(s,i){
            //补全split时丢掉的结尾
            if(i!==strArr.length-1){
                s+='\n}}\n';
            }
            //已经拆成了单个换行表达式,因此递归不会再走到这里
            str += $format(s,obj,allowHTML,$index);//console.info('得到换行表达式编译结果')

        });
        //console.log(['换行表达式解析完毕后的str',str]);
    }



    //console.log(['开始编译条件表达式',str,obj]);
//解析条件表达式
    str=str.replace(
        /{{\w+(\.\w+)*\s?\?\s?#[\w-]+\s?:\s?#[\w-]+}}|{{\w+(\.\w+)*\s?\?\s?#.+#}}|{{!?\w+(\.\w+)*\s?&{2}\s?#[\w\-]+}}|{{\w+(\.\w+)*\s?:\s?#[\w\-]+}}|{{!?\w+(\.\w+)*\s?&{2}\s#[^#].+#}}|{{\w+(\.\w+)*\s?:\s?#[^#].+#}}|{{!?\w+(\.\w+)*\s?&{2}\s?\n[^\xdd]+\n\s*}}|{{!?\w+(\.\w+)*\s?:\s?\n[^\xdd]+\n\s*}}/g,function(g){

//⚠ 这里的\s只允许用一个

//是否条件表达式 配 模版ID    {{!?\w+(\.\w+)*\s?&{2}\s?#[\w\-]+}}

//数组条件表达式 配 模版ID    {{\w+\s?\:\s?#[\w\-]+}}


//是否条件表达式 配 单行模版   {{!?\w+(\.\w+)*\s?&{2}\s?#.+#}}

//数组条件表达式 配 单行模版  {{\w+\s?:\s?#.+#}}


//是否条件换行表达式 配 多行模版 {{!?\w+(\.\w+)*\s?&{2}\s?\n[^\xdd]+\n\s*}}     //用.通配不包括\n

//数组条件换行表达式 配 多行模版 {{!?\w+(\.\w+)*\s?:\s?\n[^\xdd]+\n\s*}}

//可用 [^\f]非换页 或 [^\v]非垂直制表符 或 [.|\s]来取代[^\xdd]表示包括空格的任何字符


            g=g.replace(/^{{|}}$/g,'');


            //换行表达式是使用了 {{...换行 代替 {{..# 包裹
            //这里是捕获的子串,因此有换行符的一定是因为换行表达式进来的

            var n1=g.indexOf('\n'),x1=g.indexOf('#');

            //换行符在#前面或者没有#, 断定是换行表达式
            if(( n1>-1 && x1>-1 && n1<x1) || (n1>-1 && x1==-1)){
                var n2=g.lastIndexOf('\n');

                //这里实际是替换第一个换行,也就是换行表达式的开头
                g= g.replace(/\n/,'#');

                //这里是用截取的方式,用#替换了换行表达式的结尾
                g=g.slice(0,n2)+ '#'//+g.slice(n2+1);
            }
            //至此,换行符条件表达式已经替换为 {{...# 表达式

            g=g.trim();

            var d,t,e, j,_i,i=g.indexOf(':'),i2=g.indexOf('&&');

            //先判断是否无条件直接引入嵌套内容
            if(i==-1 && i2==-1){
                return $(g).html()||(typeof console=='object' && console.error('can`t find the inlaid template: '+id))||'';
            }

            else{
                //再判断它是 数组表达式 还是 条件表达式?
                j=(g.indexOf(':')>0 && g.indexOf(':') < g.indexOf('#')) ? 1:2;

                //插入三元判断
                // var ternary=g.has('?') && g.indexOf('?') < g.indexOf('#');
                var ternary=g.indexOf('?')>-1 && g.indexOf('?') < g.indexOf('#');
                if(ternary){
                    j=1, i=g.indexOf('?');
                }

                //取出数组属性或条件属性
                d= j==1 ? g.slice(0,i).trim():g.slice(0,i2).trim();

                //获得表达式渲染模版的起始位置
                _i=j==1 ? i:i2;

                //获得表达式渲染模版
                var gtrim=g.slice(_i+j).trim();

                //#...#包括的模版字符串
                if(g.lastIndexOf('#')==g.length-1){
                    t= gtrim.slice(1,-1);
                }
                else if(ternary){
                    t=gtrim;
                }
                //#the-tp 嵌套模版id
                else if(gtrim.indexOf('#')==0){
                    t=gtrim==='#_self_'?str:$(gtrim).html();
                }
                else{
                    //t=gtrim;
                    //暂不支持{{ a && <b>12</b> }}
                    //一定是#tpid 或 #<p>内容</p># 这两种形式之一
                    //因为与{属性}不同,{{ 条件表达式及内容 }}之间的字符自由度太大, 不能防止}}在中间出现
                }

                //插入三元判断
                if(ternary){
                    var ternaryRes=t.replace(/#\s+:\s+#/,'#:#').split('#:#');
                    if(ternaryRes.length<2){
                        ternaryRes=t.replace(/\s+:\s+/,':').split(':');
                    }
                    t=ternaryRes[getVal(d)?0:1].trim();
                    return $compile.call(the,t,obj,allowHTML);
                }

                //数组子模版表达式
                if(j===1){
                    //console.log(['进入数组子模版递归',t,obj[d]]);
                    //var xx=
                    var subData=getVal(d,function(v){return v});
                    return subData!=null ? $compile.call(the,t,subData,function(item){
                        //('super' in item)  && (console.info(item) || console.warn("don't use keyword 'super' as key"));
                        // typeof item==='object' && !item['$super'] && item.extending('$super',obj);
                        return false;
                    },allowHTML):'';

                    //console.log(['数组子模版递归完毕',xx]);
                    //return xx;
                }
                //取反条件表达式
                else if(d.indexOf('!')===0){
                    return getVal(d.slice(1))?'':$compile.call(the,t,obj,allowHTML);
                }
                //取真条件表达式
                else{
                    //console.log(['进入取真子模版递归',t,obj]);
                    //var sss=getVal(d)?$compile.apply(the,[t,obj,allowHTML]):'';
                    //console.log(['取真子模版递归完毕',xx]);
                    //return sss;
                    return getVal(d)?$compile.call(the,t,obj,allowHTML):'';
                }
            }
        });

    //console.log(['编译条件表达式完毕',str,obj]);
    //console.log(['开始编译普通属性',str,obj]);
    //普通属性占位符{....支持N级....}
    str=str.replace(/{(!)?[\$\w\d]+(\.\w+)*}/gm,function(m,p){
        //var key=m.replace(/!|{|}/g,''); // 去除{}和!
        //var val=getVal(key);
        //return p?!val:val;
        var key=m.slice(1,-1);
        return getVal(key); //取反让getVal去处理, 可以在$encode前
    });
    //$format只接受对象
    //console.log(['编译普通属性完毕',str,obj]);
    return str;
}
//整体编译 core
function $compile(source,data,arg2,arg3) {
    //这个this是$compile.apply调用时传入的固定数据对象,如权限控制对象,模版中可用{this.editLimit}
    var the=this;
    var allowHTML;
    var helper;
    var dataType=typeOf(data);

    //空数组将产生空字符串
    if(data==null || (dataType=='array' && data.length==0)){
        return '';
    }
    //节省性能,空对像也直接返回空字符串(这里可以考虑空对象依然产生编译结果,只是任一处代入数据都为空)
    else if(dataType=='object'){
        if(!Object.keys) { //兼容没有Object.keys的浏览器
            Object.keys = function (o) {
                if(o !== Object(o)) throw new TypeError('Object,keys called on a non-object');
                var k=[],p;
                for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
                return k;
            };
        }
        if(Object.keys(data).length==0){
            return '';
        }
    }
    data = dataType=='array' ? data : [data];

    if(typeof arg2=='boolean'){
        allowHTML=arg2;
    }
    //只要第二个参数不是布尔值, 就说明以标准顺序传入,不关心类型
    else{
        helper=arg2;
        allowHTML=arg3;
    }

    if(typeof source=='string' && source[0]=='#'){
        source=$(source).html();
    }
    if(!source){
        throw new Error('source undefined! please checkout the template source,id or url!');
    }

    var i=0,j=data.length,sb=[];

    for(;i<j;i++){
        typeof helper=='function' && !data[i]._xtp_helper_done_ && helper(data[i],i) //&& (data[i].extending({_xtp_helper_done_:true}));
        sb.push($format.call(the,source,data[i],allowHTML,i));
    }

    return sb.join('');
}

//某对象中该字符串属性的值
function valueAt(obj,allowHTML,$index){
    return $getVal(this.valueOf(),obj,allowHTML,$index);
}

function typeOf(e,t){
    return null===e?"null":Array.isArray&&Array.isArray(e)?"array":"function"==typeof e?t?d[u.call(e)]:"function":null===e?"null":"object"!=typeof e?t&&e!==e?"nan":typeof e:t?d[u.call(e)]||u.call(e).slice(8,-1).toLowerCase()||"object":typeof e}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "D+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "Q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    fmt=fmt||'YYYY-MM-DD hh:mm:ss';
    for(var n in {8:8,10:10})
        if(fmt.slice(0,+n).toUpperCase().replace(/\-|\.|\s|\//g,'')=='YYYYMMDD'){
            fmt=fmt.slice(0,+n).toUpperCase()+fmt.slice(+n);
        }
    if (/(Y+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    return fmt;
};
String.prototype.isEmpty = function(){
    return this.replace(/\s+/gm,'').length===0;
};
String.prototype.format = function(){
    var vname='\\{i\\}';
    var str=this;
    var agmt;
    if(typeof arguments[0]=='object'){
        return $format(this,arguments[0],arguments[1],arguments[2]);
    }
    for(var i=arguments.length-1;i>-1;i--){
        agmt=vname.replace('i',i);
        str=str.replace(new RegExp(agmt,'g'),arguments[i]==null?'':arguments[i]);
    }
    return str;
};

var $ajax = function(){
    var ags = arguments;
    var url = arguments[0],
        param = arguments[1] || {},
        cb = typeof arguments[2]==='function'?arguments[2]:function(){},
        method = arguments[3];

    var requestHead = {
        token: typeof window['token']==='string' ? window['token'] : sessionStorage.getItem("token")
    };


    $.ajax({
        type:method || 'POST',
        url:url,
        headers:requestHead,//一个额外的"{键:值}"对映射到请求一起发送。此设置会在beforeSend 函数调用之前被设置 ;因此，请求头中的设置值，会被beforeSend 函数内的设置覆盖
        contentType:'application/json;charset=UTF-8',//当将数据发送到服务器时，使用该内容类型
                                                     //不使用contentType: “application/json”则data可以是对象
                                                     //使用contentType: “application/json”则data只能是json字符串
        dataType:'json', //string 从服务器返回你期望的数据类型
        cache:false, //浏览器将不缓存此页面,在GET请求参数中附加"_={timestamp}"
        data:method==='GET' ? param : JSON.stringify(param),
        beforeSend:function(){},
        error:function(){},
        success:function(res){
            //访问成功
            if(res.flag===1){
                cb(res);
            }
            //token过期
            else if(res.flag===-1){

            }
            //后台报错
            else if(res.flag===0){
                console.warn(res.data.msg);
            }
        },
        complete:function(){}
    });
};
var $post = function(url,param,cb){
    $ajax(url,param,cb,'POST');
};
var $get = function(url,param,cb){
    $ajax(url,param,cb,'GET');
};

var sessionData = {
    set:function(key,value){
        if(sessionStorage){
            sessionStorage.setItem(key,JSON.stringify(value));
        }
        else{
            console.error('无法获取sessionStorage');
        }
    },
    get:function(key){
        var jsonstr,jsonobj;
        if(sessionStorage){
            jsonstr = sessionStorage.getItem(key);
            jsonobj = JSON.parse(jsonstr);
            return jsonobj;
        }
        else{
            console.error('无法获取sessionStorage');
        }
    }
};

//$module
/*
var modules=Object.create(null);

var hasOwnProp=Object.prototype.hasOwnProperty;

var extend=function(targetObj,newExtend){
    Object.keys(newExtend).forEach(function(k){
        targetObj[k]=newExtend[k];
    });
};

var deepSet=function (key,val,obj){
    var arr=key.split('.');
    var len=arr.length;
    var sub=obj;

    for(var i=0;i<len;i++){
        var k=arr[i];
        var last=i==arr.length-1;

        //原型继承属性不可赋值, x-name中不可出现,如filter,原生toString,原生length
        if(!hasOwnProp.call(sub,k) && typeof sub[k]!=='undefined'){
            throw new Error('can not set a prefix property which is not ownProperty');
        }

        if(!last){
            //如果是undefined,可以初始化为空对象
            if(typeof sub[k]==='undefined'){
                sub[k]=Object.create(null);
            }
            //其他非Object类型:Function,Number,Boolean,String都不能作为中间属性(null也不可以)
            else if(typeof sub[k]!=='object' || sub[k]===null){
                throw new Error('can not set a prefix property which is null or typeof Number,Boolean,Function');
            }
            //至此可以安全转换到下一级属性
            sub=sub[k];
        }
        else{
            sub[k]=val;
        }

    }
    return obj;
};

var deepGet=function(key,obj){
    var index=key.indexOf('.');
    var k=key.slice(0,index);
    var rest=key.slice(index+1);
    var firstObj=obj[k];
    if(firstObj && firstObj.isScope){
        return firstObj.get(rest);
    }
    if(index===-1){
        return obj[key];
    }
    else{
        return deepGet(rest,firstObj)
    }
};

function $module(){
    var name,m;
    // get
    if(typeof arguments[0]=='string' && arguments.length==1){
        return deepGet(arguments[0],modules);
    }


    // define
    else if(typeof(arguments[0])=='string'){

        name=arguments[0], m=arguments[1];

        if(typeof(modules[name])==='object' && typeof(m)==='object' && modules[name]!==null && m!==null){
            extend(modules[name],m);
        }
        else{
            deepSet(name,m,modules);
        }

        return $module;
    }
}*/
