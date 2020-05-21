const {useState,useEffect,useRef,useMemo,useCallback,useLayoutEffect,forwardRef,useImperativeHandle} = React;
/*
 * todo
 * useLayoutEffect,forwardRef,useImperativeHandle
 * useContext
 * useReducer
 * */

 class ReactHookInClass{
    _checkParam(options){
        // 会执行2次，第二次不检查
        let zMultipleList = [];
        _.reduce([].concat(_.keys(options.methods),_.keys(this._sourceState),_.keys(options.computed)),(m,v)=>{
            if(m[v])zMultipleList.push(v);
            return _.extend(m,{[v]:true})
        },{});
        if(zMultipleList.length)console.warn(`[${String(zMultipleList)}] was already defined  in  state or computed or methods`)
    };
    _sourceState={};
    _preState={};
    _preProps={};
    _openMethods={

    };
    _computerList={};
    _watcherList={};
    _methodList={};
    _isPropItemLegal(k,v,options){
        let zReturn=true;
        if(_.isArray(options.type)){
            zReturn= _.reduce(options.type,(m,xClass)=>{
                if(!m)return m;
                if(xClass===String)return _.isString(v);
                if(xClass===Number)return _.isNumber(v);
                if(xClass===Boolean)return _.isBoolean(v);
                if(xClass===Array)return _.isArray(v);
                if(xClass===Object)return _.isObject(v);
                if(xClass===Function)return _.isFunction(v);
                if(xClass===Symbol)return _.isSymbol(v);
                return v instanceof xClass
            },true);
            let zTypes=_.map(options.type,(xClass)=>{
                return xClass.name || xClass
            });
            if(!zReturn){
                console.warn(`${k} should be ${zTypes} type`);
                return false
            }
        }
        if(_.isFunction(options.validator)){
            zReturn=options.validator(v);
            if(!zReturn){
                console.warn(`props.${k} does not pass validation`);
                return false
            }
        }
        return true
    };
    //props 不存在 返回所有props,存在
    //["a","b"];
    //{a:String.b:[Number,String]}
    //{a:{type:[Number,String]}}
    _getProps(propDef,props){
        if(_.isArray(propDef)){
            return _.pick(props,propDef)
        }
        if(typeof propDefintion != 'object')return props;
        let zReturnProps={};
        _.each(propDef,(v,k)=>{
            let zOptions={type:null,default:null,validator:null};
            if( _.isArray(v))zOptions.type=v;
            else if(_.isFunction(v))zOptions.type=[v];
            else if(_.isObject(v))_.extend(zOptions,v);
            else zOptions.validator=()=>{return props[k]===v};
            this._isPropItemLegal(k,props[k],zOptions);
            _.extend(zReturnProps,_.extend({[k]:zOptions.default},_.pick(props,k)))
        });
        return zReturnProps
    };
    _getComponent(options){
        return (props)=>{
            this._props=options.props=this._getProps(options.props,props);
            _.extend(options,this._openMethods);
            // useState
            this._sourceState=options.state || {};
            this._checkParam(options);
            let zSetFuncList={};
            let zSetValueList={};
            _.each(this._sourceState,(v,k)=>{
                const [zV,zSetV]=useState(v);
                options.state[k]=zV;
                options[k]=zV;
                zSetValueList[k]=zV;
                zSetFuncList[k]=zSetV;
            });
            // setState
            options.$setState=(xObj)=>{
                _.each(xObj,(v,k)=>{
                    if(zSetFuncList[k])zSetFuncList[k](v)
                })
            };

            //useRef
            options.$refs={};
            _.each(options.refs,(v,k)=>{
                options.$refs[k]=useRef();
            });
            // Methods useCallback
            _.forEach(options.methods,(v,k)=>{
                options[k]=v;
                v.call(options,(performer,memo)=>{
                    if(!_.isArray(this._methodList[k]))return this._methodList[k]=[performer,memo];
                    this._methodList[k][1]=memo;
                });
            });
            _.each(this._methodList,(performer,k)=>{
                options[k]=useCallback(()=>performer[0].call(options),performer[1])
            });

            //watch useEffect
            _.each(options.watch,(v,k)=>{
                v.call(options,(watcher,memo)=>{
                    if(!_.isArray(this._watcherList[k]))return this._watcherList[k]=[watcher,memo];
                    this._watcherList[k][1]=memo;
                });
            });
            _.each(this._watcherList,(watcher,k)=>{
                useEffect(()=>watcher[0].call(options),watcher[1])
            });

            //computed useMemo
            _.each(options.computed,(v,k)=>{
                options[k]=v;
                v.call(options,(computer,memo)=>{
                    if(!_.isArray(this._computerList[k]))return this._computerList[k]=[computer,memo];
                    this._computerList[k][1]=memo;
                });
            });
            _.each(this._computerList,(xComputer,k)=>{
                options[k]=useMemo(()=>xComputer[0].call(options),xComputer[1])
            });
            // 生命周期
            const mounted = useRef();
            useEffect(() => {
                if (!mounted.current){
                    mounted.current = true
                }
                else {
                    if(_.isFunction(options.componentDidUpdate))options.componentDidUpdate(this._preProps,this._preState)
                }
                this._preProps=props;
                this._preState=zSetValueList;
            });
            useEffect(() => {
                if(_.isFunction(options.componentDidMount))options.componentDidMount();
                return options.componentWillUnmount
            }, []);
            return _.isFunction(options.render)?options.render():undefined;
        }
    };
    constructor(options){
        if(_.isFunction(options.componentWillMount))options.componentWillMount();
        return React.memo(this._getComponent(options),
            (nextProps, nextState)=>{
                if(_.isFunction(options.shouldComponentUpdate))return options.shouldComponentUpdate(nextProps, nextState)
            }
        )
    }
}
