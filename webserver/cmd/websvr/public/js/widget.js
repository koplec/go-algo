"use strict";
/*global
 Signal, uuid, El
 */

/**
 * Widgetの仕事
 *  Widgetの生成
 *  各Widgetに共通するイベントを通知
 * 
 *  displayメソッドで表示
 * 
 */
class Widget {
    constructor(opt){
        opt = Object.assign({
            elem: null,
            elem_id:null, classNames:[], 
            widgets : [], parent: null, key:uuid()
        }, opt || {}); //userの定義した値を優先
        for(let k in opt){
            if(opt.hasOwnProperty(k)) this[k] = opt[k];
        }

        Widget.append(this);   //id:Widgetが発行するid
        this.key = opt.key; //子widgetを決めるためのkey
        //element生成
        if(opt.elem){
            this.elem = opt.elem;
        }else{
            let elemId = opt.elem_id;
            if(elemId){
                this.elem = El(opt.elem_id, opt.classNames);
            }else{
                elemId = uuid();
                this.elem = El.div( opt.elem_id, opt.classNames);
            }
        }
        if(opt.style) Object.assign(this.elem.style, opt.style);
        
        //子widget作成
        this.widgets = opt.widgets.map((w) => new Widget(w));
        //
        this._init(opt);
        if(opt._doDisplay && (typeof opt._doDisplay) === "function"){
            this._doDisplay = opt._doDisplay;
        }
    }
    display(){
        this._doDisplay();
        Widget._signal.send(`${this.id}_doneDisplay`);
        return this.elem;
    }
    _init(opt){}//ここで描画したりしない
    _doDisplay(){
        //どうwidgetを配置するかをここで具体的に書く?
        throw "Not implemented _doDisplay";
    }
    _afterDisplay(){
        //表示しないと計算できないことはここで計算する
    }
    beforeShow(){
        //showする前にやることを書く
    }
    show(){ 
        this.beforeShow();
        this.elem.classList.remove("hidden"); 
    }
    hide(){ 
        this.elem.classList.add("hidden"); 
    }
    redraw(){}
    addWidget(widget){ 
        widget.parent = this;
        this.widgets.push(widget); 
        return widget;
    }
    widget(key){
        /** widgetの中からkeyで検索 */
        return this.widgets.find((w) => { return w.key === key; } );
    }
    delete(){
        this.elem.parentElement.removeChild(this.elem);
    }
}
Object.assign(Widget, {
    _signal : new Signal(), _widgets : {},
    
    widget: function(widget_id){
        return Widget._widgets[widget_id];
    },
    append: function(w){
        /**
         * widget(w)にidを発行して、Widget._widgetsに登録する
         */
        const id = uuid();
        w.id = id;
        Widget._widgets[id] = w;
        Widget._signal.connect(`${w.id}_doneDisplay`, w, w._afterDisplay);
        return w;
    },

    overlay: function(widgetClass, opt){
        /**
         * var a = Widget.overlay(HogeWidget, opt)の呼び出しで、
         * 灰色のoverlayの真ん中にHogeWidgetのインスタンスが生成される
         * optは、HogeWidgetを初期化するときに使われる。
         * 
         * aはHogeWidgetのクラス
         * a.hide()で消える
         */
        var ret = {};
        var overlay = El.div(null, "js_widget__overlay");
        var container = document.body;
        var w = new widgetClass(opt);
        overlay.appendChild( w.display() );
        container.appendChild( overlay );
        w.elem.classList.add("js_widget__overlay__window")

        w.hide = function(){
            w.constructor.prototype.hide.call(this);
            overlay.removeChild( w.elem );
            container.removeChild(overlay);
            w = null;
        }
        
        w.show();
        return w;
    }

});

class BtnGroupWidget extends Widget{
    /**
     * 複数のボタンを表示する
     * ボタン一つ一つを押すことができる
     * activeになる。ならない。
     * どのボタンがactiveかどうか activeボタン一覧取得
     * 
     * 一つずつしか押せないか、すべて押すことができるか
     * 押して効果が出た後、元に戻るタイプもある
     * resetボタンがあったほうがいいのかないほうがいいのか？
     * 
     * 
     * ボタン要素には、activeのclassがつくが、ボタンオブジェクトに状態を持たせない。
     */
    constructor(opt){
        opt = Object.assign({ 
            title: null, signal:null, type:BtnGroupWidget.TYPE.CHECKBOX,
            buttons: [] 
        }, opt);
        super(opt);
        const self = this;
        this.elem.classList.add("btn_group_widget");
        if(opt.type){
            this.type = opt.type
        } else{
            this.type = BtnGroupWidget.TYPE.MULTIPLE;
        }
        this._signal = opt.signal? opt.signal : new Signal(); 
        
        //bootstrapの設定
        this.elem.classList.add("btn-group");
        if(opt.size) this.elem.classList.add(`btn-group-${opt.size}`);

        this.elem.setAttribute("role", "group");
        this.buttons = opt.buttons.map((b) => {
            if(!b.key) b.key = uuid();
            return b;
        });

        //要素の作成
        //タイトル
        if(opt.title){
            let title = El.divText(opt.title + " ", null, "btn_group_widget__title"); //横並びのボタン
            this.elem.appendChild(title);
        }
        //ボタン類
        this._buttonElems = this.buttons.map((b) => {
            const id = b.id || uuid();
            const elem = El.button(id, ["btn", "btn-default"]);
            //ボタンの時とボタン以外の時がある
            //レイアウトの問題
            if(b.checked) elem.classList.add("active");

            if(b.icon){
                const icon = El.span(null, ["glyphicon", `glyphicon-${b.icon}`])
                icon.setAttribute("aria-hidden", true);
                elem.appendChild(icon);
                if(b.label) elem.appendChild(El.text(` ${b.label}`))
            }else{
                elem.appendChild(El.text(b.label))
            }
            
            if(b.style){
                for(let [key, val] of entries(b.style)){
                    elem.style[key] = val;
                }
            }
            elem.model = function(){ return b; }

            elem.addEventListener('click', () => {                
                switch(self.type){
                    case BtnGroupWidget.TYPE.BUTTON: //見た目を変えるだけ
                        self.deactiveAll();

                        break;
                    case BtnGroupWidget.TYPE.RADIO: //見た目を変えた後、signalを送る
                        if(elem.classList.contains('active')){
                            elem.classList.remove('active');
                        }else{
                            self._buttonElems.forEach((e) => {
                                if(e !== elem){
                                    e.classList.remove('active')
                                }
                            });
                            elem.classList.add('active');
                            self._signal.send(BtnGroupWidget.SIGNAL.SELECT, b );
                        }
                        break;
                    case BtnGroupWidget.TYPE.CHECKBOX: //見た目を変えた後、signalを送る
                        if(elem.classList.contains('active')){
                            elem.classList.remove('active');
                        }else{
                            elem.classList.add('active');
                            self._signal.send(BtnGroupWidget.SIGNAL.SELECT, b );
                        }
                        break;
                }
                self._signal.send(BtnGroupWidget.SIGNAL.CLICKED, b );
            }, false);

            //ほかにボタン独自でやってほしいことがあれば、ここに記述
            //clickは、signalでイベントを送るから、mouseoverとかそのあたりを独自にしたいなら使う感じか？
            if(b.events){
                b.events.forEach((event) => {
                    let type = event[0];
                    let handler = event[1];
                    let capture = (event.length > 2)?  event[2] : false;
                    elem.addEventListener(type, (evt) => {
                        handler(evt, b);
                    }, capture);
                })
            }


            this.elem.appendChild(elem);

            this._init(opt);
            return elem;
        })
    }
    _doDisplay(){}
    deactiveAll(){
        this._buttonElems.forEach((e) => { 
            e.classList.remove('active'); 
        });
    }
    selected(){//現在activeであるelementの元のobject一覧取得
        return this._buttonElems
            .filter((elem) => { return elem.classList.contains('active')})
            .map((elem) => { return elem.model();})
    }
    connect(evt, obj, fn){//イベントを聞く
        return this._signal.connect(evt, obj, fn)
    }
}
BtnGroupWidget.TYPE = {
    BUTTON : Symbol("buton"),     //押したあと、すぐにnonactiveに戻る actionへのショートカット
    RADIO : Symbol("radio"),      //一つのボタンだけ押したままの状態にできる
    CHECKBOX : Symbol("checkbox"), //複数のボタンを押したままの状態にできる
    
}
BtnGroupWidget.SIZE = {
    LARGE: "lg",
    SMALL: "sm",
    X_SMALL: "xs"
}
BtnGroupWidget.SIGNAL = {
    SELECT : "btn_group_widget__signal__select", //ボタンが選択された
    CLICKED :  "btn_group_widget__signal__clicked", //ボタンがクリックされた（たんなるクリック）
}

class ButtonWidget extends Widget{
    constructor(opt){
        opt = Object.assign({
            elem_id: null,
            classNames: [], icon: null, label: null, style: {},
            events: [], value:null
        }, opt);
        opt.elem = El.button(opt.elem_id, opt.classNames);

        super(opt);
        let that = this;
        that._signal = new Signal();

        let elem = that.elem;

        elem.classList.add('btn');
        if( ['btn-primary', 'btn-success', 'btn-info', 'btn-warning', 'btn-danger', 'btn-link']
            .every((btnType) => {
                return !elem.classList.contains(btnType)
            })
        ){
            elem.classList.add('btn-default');
        }
        if(opt.icon){
            const icon = El.span(null, ["glyphicon", `glyphicon-${opt.icon}`])
            icon.setAttribute("aria-hidden", true);
            elem.appendChild(icon);
            if(opt.label) elem.appendChild(El.text(` ${opt.label}`));
            this.icon = icon;
        }else{
            elem.appendChild(El.text(opt.label))
        }
        //signal経由で送る
        elem.addEventListener('click', (evt) => {
            that._signal.send(ButtonWidget.SIGNAL.CLICKED, evt, opt);
        }, false);

        if(opt.events){
            opt.events.forEach((event) => {
                let type = event[0];
                let handler = event[1];
                let capture = (event.length > 2)?  event[2] : false;
                elem.addEventListener(type, (evt) => {
                    handler(evt);
                }, capture);
            });
        }
        that._init(opt);
    }
    _doDisplay(){}
    connect(evt, obj, fn){//イベントを聞く
        return this._signal.connect(evt, obj, fn)
    }
    changeIcon(icon_class){
        if(this.icon){
            this.icon.className = "";
            this.icon.classList.add("glyphicon");
            this.icon.classList.add(`glyphicon-${icon_class}`);
        }
    }

}
ButtonWidget.SIGNAL = {
    CLICKED :  "button_widget__signal__clicked", //ボタンがクリックされた（たんなるクリック）
}

class WindowWidget extends Widget {
    constructor(opt){
        opt = Object.assign({
            title:null, content: null, draggable:true
        }, opt);
        super(opt);
        this.elem.classList.add("js_window_widget")
    }
    _init(opt){
        var that = this;
        this.title = El.div( null, "js_window_widget__title");
        if(opt.title){
            this.title.textContent = opt.title;
        }
        var hideIcon = El.divIcon({
            icon:"remove",
            classNames:["js_window_widget__title_hide_btn"]
        });
        this.title.appendChild( hideIcon );
        hideIcon.addEventListener('click', function(evt){
            that.hide();
        }, false);

        this.elem.appendChild(this.title);

        //titleバーにドラッグ機能をつける
        if(opt.draggable){
            this.title.addEventListener('mousedown', (evt) => {
                El.drag(this.elem, evt)
            }, false);
        }

        if(opt.content){
            //contentが文字列の場合
            if(typeof opt.content == "string"){
                this.content = El.div(null, "js_window_widget__content");
                this.content.textContent = opt.content;
            }else if((typeof opt.content) === "function"){
                this.content = El.div(null, "js_window_widget__content");
                
                this.content.appendChild( opt.content.call(this) );
            }else if((typeof opt.content) === "object"){
                this.content = El.div(null, "js_window_widget__content");
                this.content.appendChild( opt.content );
            }else{
                this.content = El.div(null, "js_window_widget__content");
            }
        }
        this.elem.appendChild(this.content);

        if(opt.footer){
            //footerが文字列の場合
            if((typeof opt.footer) === "string" || opt.footer instanceof String){
                this.footer = El.div(null, "js_window_widget__footer");
                this.footer.textContent = opt.footer;
            }else if((typeof opt.footer) === "object"){
                this.footer = El.div(null, "js_window_widget__footer");
                let buttons = opt.footer.buttons;
                if(buttons){
                    buttons.forEach((btn) => {
                        let w = this.addWidget(new ButtonWidget(btn));
                        this.footer.appendChild(w.display());
                    });
                }
            }
            if(opt.footer.classNames){
                opt.footer.classNames.forEach((cls) => {
                    this.footer.classList.add(cls);
                })
            }    
        }
        if(opt.footer) this.elem.appendChild(this.footer);
    }
    _doDisplay(){

    }
}

class InputDialog extends WindowWidget { 
    constructor(opt){
        opt = Object.assign({
            //input dialogが扱うinput
            //中にはobject{key:(データ受け渡し) name:(表示に利用 無いときはkey)}
            inputs : [], 
            content: function(){
                var that = this;
                var a = El.div(null, ["js_input_dialog__content"]);
                that.inputText = {};
                for(var input of that.inputs){
                    var d = El.div();
                    var name = input.name || input.key;
                    var nameEl = El.spanText(name + " : ", null, ["js_input_dialog__name"])
                    var inputText = El.inputText(null, ["js_input_dialog__input"]);
                    d.appendChild(nameEl);
                    d.appendChild(inputText);
                    a.appendChild(d);

                    that.inputText[input.key] = inputText;
                }

                return a;
            },
            draggable : false,
            footer : {
                buttons : [
                    //okボタンを押した時は、イベントが発生
                    {label  : "OK", key: "ok", value:InputDialog.VALUE.OK, classNames:["js_input_dialog__button"]},
                    //cancelボタンを押した時は何も行わない
                    {label : "Cancel", key:"cancel", value:InputDialog.VALUE.Cancel, classNames:["js_input_dialog__button"]}
                ]
            },
        }, opt)
        super(opt);

        var that = this; //thatの参照はsuperのあと
        that._signal = new Signal();


        //外見
        that.elem.classList.add("js_input_dialog");

        //event
        that.widget("ok").connect(ButtonWidget.SIGNAL.CLICKED, null, function(evt, opt){
            var inputValues = {}
            for(var key of Object.keys(that.inputText)){
                inputValues[key] = that.inputText[key].value;
            }
            that._signal.send(InputDialog.SIGNAL.OK, evt, inputValues)
            that.hide();
        } );
        that.widget("cancel").connect(ButtonWidget.SIGNAL.CLICKED, null, function(evt, opt){
            that.hide();
        });
    }
    _init(opt){
        super._init(opt);
    }
    connect(evt, obj, fn){//signalからのイベント取得 
        return this._signal.connect(evt, obj, fn);
    }
}
InputDialog.VALUE = {
    OK : "OK",
    Cancel : "Cancel"
};
InputDialog.SIGNAL = {
    OK : "input_dialog__signal__onok"//OKボタンがおされた時に発行される
}
/**
 * ConfirmWidget
 * ユーザにYes/Noを聞く(optionにより複数の選択肢を作ることができる)
 * ユーザがYes/Noをクリックするまで先に進まない
 * ユーザが操作できないように全体を灰色のDIVで覆う
 */
class ConfirmWidget extends Widget {
    constructor(opt){
        opt = Object.assign({
            title: null, message: null, elem: El.div(null, "js_confirm_widget"),
            options: [
                {label:"YES", value:ConfirmWidget.VALUE.YES, classNames:["js_confirm_widget__button"], key:"YES"},
                {label:"NO", value:ConfirmWidget.VALUE.NO, classNames:["js_confirm_widget__button"], key: "NO"}
            ]
        }, opt);
        super(opt);

        let that = this;
        this._signal = new Signal();

        this.addWidget( new WindowWidget({
                key : "window", 
                classNames: ["js_confirm_widget__window"],
                title: opt.title, content: opt.message, draggable: false,
                footer: {
                    buttons: opt.options,
                    classNames: ["js_confirm_widgget__footer"]
                }
            })
        );

        let w = this.widget("window");
        opt.options.forEach((o) => {
            let optionWidget = w.widget(o.key);
            if(optionWidget){
                optionWidget.connect(ButtonWidget.SIGNAL.CLICKED, null, (evt, opt) => {
                    that._signal.send(ConfirmWidget.SIGNAL.CLICKED, evt, opt);
                });
            }
        })
    }
    
    _doDisplay(){
        this.elem.appendChild( this.widget("window").display() );
    }

    connect(evt, obj, fn){
        this._signal.connect(evt, obj, fn);
        return this;
    }
}

ConfirmWidget.VALUE = {
    YES:1,
    NO:0
}
ConfirmWidget.SIGNAL = {
    CLICKED: "confirm_widget__signal__clicked"
}

ConfirmWidget.show = function(o){
    o = Object.assign({
        title: null, 
        message: null,
        container: document.body,
        yes: function(evt, opt){},//yesボタンを押した後の動き
        no : function(evt, opt){} //noボタンを押した後の動き
    }, o);
    let title = o.title, message = o.message, container = o.container;
    let w = new ConfirmWidget({title:title, message:message});
    container.appendChild( w.display() );
    w.hide = function(){
        w.constructor.prototype.hide.call(this);
        container.removeChild(w.elem);
        w = null;
    }
    w.message = function(msg){
        this.widget("window").content.textContent = msg;
    }
    w.connect(ConfirmWidget.SIGNAL.CLICKED, null, (evt, opt) => {
        if(opt.value === ConfirmWidget.VALUE.YES){
            //時間がかかるイベント？
            o.yes(evt, opt);
        }

        if(opt.value === ConfirmWidget.VALUE.NO){ 
            o.no(evt, opt);
            w.hide()
        }
    });

    w.show();
    return w;
}