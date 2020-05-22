# reacthookinclass

reacthookinclass 可以帮助你用类似vue 的 new Class() 写法 实现 react hook 的 function



#### why use reacthookinclass

react hook 在无状态函数中实现自己的状态非常反直觉，

写函数式组件时，关注点会被更多业务以外的地方分散，比如是否需要使用hook，使用何种hook

不强制分类定义，也不强制使用hook优化，代码难以维护

出问题调试的时候，hook用法不正确也成为一个可能性，不得不多打一个断点

其实在写业务组件时应该把关注点更多的放在业务上，hook的用法应该在更高层面比如框架的层面去关心

所以使用 reacthookinclass 可以避免直接使用hook，只需要关注业务即可，使用者甚至不需要了解hook

用法对vue 和 react class 使用者都比较友好




## Getting start


Install with npm:

```
npm install reacthookinclass
```

Then `require` and use it in your code:


```
import _ from "underscore"
import React from 'react'
impport HookClass from 'reactHookInClass'

// your code like this
const Page=new HookClass({
    componentWillMount(){
        console.log("componentWillMount")
    },
    componentWillUnmount(){
        console.log("componentWillUnmount")
    },
    componentDidMount(){
        console.log("componentDidMount",this,this.count,this.props);
    },
    shouldComponentUpdate(nextProps, nextState){
        console.log("shouldComponentUpdate",nextProps, nextState,this.props,this.state)
    },
    componentDidUpdate(prevProps,prevState){
        console.log("componentDidUpdate",prevProps, prevState,this.props,this.state)
    },
    props:{
        value:String
    },
    state:{
        count:0,
        val:undefined,
    },
    computed:{
        doubleCount(xUseMemo){
            xUseMemo(()=>{return this.count*2},[this.count]);
        }
    },
    methods:{
        onBtnClick(xUseCallback){
            xUseCallback(()=>{this.$setState({count:this.count+1})},[this.count])
        },

        clickChangeStateButton(xUseCallback){
            xUseCallback(()=>{
                this.$refs.changeStateButton.current.click()
            })
        }
    },
   
    watch:{
        setValue2State(xUseEffect){
            xUseEffect(()=>{this.$setState({val:this.props.value})},[this.props.value])
        },
    },
     refs:{
        changeStateButton:{}
    },
    render(){
      return (<div>
          <button onClick={()=>this.clickChangeStateButton()}>clickChangeStateButton</button>
          <br/>
          <button ref={this.$refs.changeStateButton} onClick={()=>this.onBtnClick()}>change state</button>
          <br/>
          props.value:{this.props.value}
          <br/>
          state.value:{this.val}
          <br/>
          count:{this.count};
          <br/>
          doubleCount:{this.doubleCount}
          </div>)
    }
});


ReactDOM.render(<div>
    <Page />
  </div>,
  document.getElementById('root')
);

```



#### props

类似于vue 的props,

若不定义此参数，则可直接通过this.props 获取所有的props

若定义则未定义的props将被丢弃

```
props:null,
props:['value','name']
props:{value:String,name:[Value,String]}
props:{value:{ type:String,
               default:"test",
               validator:()=>{
                   return value.length<10
               }
             }
	  }
	  
```



#### state

就是 react 的 state

会使用 useState 分别替换每一个属性

```
state:{value:"1",
	name:"test"	
},
render(){
    return(<div>{this.value}---{this.name}</div>)
}
```

#### $setState

和 react 的 setState 一致，

```
componentDidMount(){
    this.$setState({value:"2"})
},
state:{value:"1",
	name:"test"	
},
render(){
    return(<div>{this.value}---{this.name}</div>)
}
```



#### computed

类似于vue的计算属性

其每个属性必须是一个函数

函数的第一个参数 为 函数 ，使用方式和React.useMemo 一致

useMemo (computer,memo)

​	computer : Function  return 计算后的值

​	memo：Array ，用于判断合适重新计算，若为空，则每次都会执行

```
state:{value:"1",
	name:"test"	
},
computed:{
    addValueName(useMemo){
        useMemo(()=>{return this.value+this.name},[this.value,this.name])
    }
},
render(){
    return(<div>{this.value}---{this.name}</div>)
}
```

#### methods

类似于vue的methods

其每个属性必须是一个函数

函数的第一个参数 为 函数 ，使用方式和React.useCallBack一致

useCallBack(callback,memo)

​	callback : Function  一个函数

​	memo：Array ，用于判断是否重新定义callback方法，为空则每次都会重新定义

```
state:{value:"1",
	name:"test"	
},
methods:{
    formatValue(useCallback){
        useCallback((format)=>{this.$setState({value:this.value+format})},[this.value])
    }
},
render(){
	this.formatValue('123');
    return(<div>{this.value}---{this.name}</div>)
}
```

#### watch

类似于vue的watch

其每个属性必须是一个函数

函数的第一个参数 为 函数 ，使用方式和React.useEffect一致

useEffect(event,memo)

​	event : Function  一个函数，当event 函数中 return 一个函数时，返回的函数会在下次event执行(或销毁)之前执行

​	memo：Array ，用于判断是否触发event，为空则每次都会重新触发

```
state:{value:"1",
	name:"test"	
},
watch:{
    onValueChange(useEffect){
        useEffect(()=>{console.log("onValueChange")},[this.value])
    }
},
render(){
    return(<div>{this.value}---{this.name}</div>)
}
```

#### render

react class 组件的render  

return 一段 jsx  用来渲染html



#### refs，$ref

目前只有定义作用，将来会通过 useLayoutEffect,forwardRef,useImperativeHandle 增加详细定义

可通过this.$refs[属性名] 使用

```
state:{value:"1",
	name:"test"	
},
methods:{
    this.onBtnClick(){...}
},
refs:{
   changeStateButton:{}
},
render(){
    return(<div>
    <button ref={this.$refs.changeStateButton} onClick={()=>this.onBtnClick()}>change 		state</button>
    </div>)
}
```





#### 生命周期	

模拟react的生命周期,目前支持以下几种

1. omponentWillMount()
2. componentWillUnmount()
3.  componentDidMount()
4.  shouldComponentUpdate(nextProps, nextState)
5.  componentDidUpdate(prevProps,prevState)

 








