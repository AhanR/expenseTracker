import { useState, useEffect, useReducer } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Pressable, SafeAreaView, TextInput } from 'react-native';

export default function App() {
  
  const [expenses, setExpenses] = useReducer((state, action) => {
    if(action.action == 1) {
      let i = 0
      for(; i < state.lenth && state[i].key != action.key; i++); 
      state[i] = {item : action.data, cost : state[i].cost, key : action.key};
    }
    else if(action.action == 0){
      let i = 0
      for(; i < state.lenth && state[i].key != action.key; i++); 
      state[i].cost = parseInt(action.data);
    }
    else if(action.action == 2) {
      for(let i = 0; i < state.length; i++) if(state[i].key == action.data.key) return state;
      state.push(action.data);
    }
    
    return state;
  }, []);
  const [items, setItems] = useState(0);
  const [editor, setEditor] = useState({open : false, key : 0});

  useEffect(() => {
    console.log("Changing expenses",expenses);
  }, [expenses])
  

  return (
    <>
      <StatusBar
      />
      <View
        style= {styles.body}
      >
        <ScrollView
          style={[styles.scroller]}
        >

        {expenses.map(expense => {
          return(
            <Expense
              item = {expense.item}
              cost = {expense.cost}
              key = {`${expense.key}`}
              id = {expense.key}
              setEdit = {setEditor}
              />
              );
            })}

        </ScrollView>
        <View
          style = {{
            display : 'flex',
            flexDirection : 'row',
            justifyContent: 'space-between',
            backgroundColor : '#191919',
          }}
          >
          <Btn
            style = {styles.button}
            textStyle = {{
              color : '#4915be',
              // fontWeight : 700,
            }}
            title = "Remove Expense"
            
            />
          <Btn
            style = {[styles.button, styles.primary]}
            textStyle = {{
              color : 'white',
              // fontWeight : 500,
            }}
            title = "Add Expense"
            onPress={()=> {
              console.log("Add exp");
              setExpenses({ data : {item : 'Untitled', cost : 0, key : items}, action : 2 })
              setEditor({open : true, key : items});
              setItems(items+1);
            }}
            />
        </View>
        <Popup
          open = {editor}
          opener = {setEditor}
          setExpenses = {setExpenses}
        />
      </View>
    </>
  );
}

const Btn = (props)=> {
  return (
    <Pressable
      style= {props.style}
      onPress = {props.onPress}
    >
      <Text
        style={props.textStyle}
      >{props.title}</Text>
    </Pressable>
  )
}

const Expense = (props) => {
  const [cost, setCost] = useState(props.cost)
  const [item, setItem] = useState(props.item)
  return (
    <View
      style={[styles.expense]}
    >
      <Text style = {[{
        color : 'white',
        // fontWeight : 500,
      }]}>{item}</Text>
      <View 
        style={{
          display : 'flex',
          flexDirection : 'row',
        }}
      >
        <Text style = {[{
          color : 'white',
          // fontWeight : 500,
        }]}>₹{cost}</Text>
        <Btn
          style ={{
            marginLeft : 20,
            borderRadius : 10,
            minHeight : 10,
          }}

          textStyle = {{
            color : 'white',
          }}

          title="E"

          onPress = {()=> {
            props.setEdit({open : true, key : props.id})
          }}
        />
      </View>
    </View>
  )
}

const Popup = (props) => {
  let itemSaveTimer;

  return (
    (props.open.open) ? <View
      style={styles.modal}
    >
      <Btn
        title = "X"
        style = {styles.closeButton}
        onPress = {() => {
          props.opener({open : false, key : props.id})
        }}
      />
      <View
        style = {{
          width : '100%',
          alignItems : 'center',
        }}
      >
        <TextInput
          style = {styles.input}
          placeholder = "add item name"
          onChangeText= {(text) => {
            clearTimeout(itemSaveTimer);
            itemSaveTimer = setTimeout(()=>props.setExpenses({action : 1, data : text, key : props.open.key}) , 300);

        }}
        />
        <TextInput
          style = {styles.input}
          placeholder = "add item cost"
          keyboardType = "number-pad"
        />
      </View>
    </View> : <></>
  )
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#eee',
  },
  button : {
    flex : 1,
    padding : 10,
    borderRadius : 10,
    margin : 10,
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center',
    borderColor : '#4915be',
    borderWidth : 1,
  },
  primary : {
    backgroundColor : '#4915be',
  },
  scroller : {
    flex: 1,
    width : '100%',
    backgroundColor : '#191919',
  },
  expense : {
    flex : 1,
    padding : 30,
    margin : 10,
    maxHeight : 100,
    borderWidth : 2,
    borderRadius : 10,
    borderColor : '#4915be',
    display : 'flex',
    flexDirection : 'row',
    justifyContent : 'space-between',
    backgroundColor : '#191919',
    color : 'white',
  },
  input : {
    marginBottom : 20,
    padding : 10,
    width : '80%',
    color : 'white',
    borderBottomColor : '#4915be',
    borderBottomWidth : 1,
    backgroundColor : '#505050',
    borderRadius : 10,
  },
  closeButton : {
    position : 'absolute',
    top : 0,
    right : 0,
    padding : 10,
    margin : 20,
    borderRadius : 50,
    borderColor : 'white',
    borderWidth : 1,
  },
  modal : {
    position : 'absolute',
    top : '10%',
    left : 0,
    width : '100%',
    height : '90%',
    zIndex : 2,
    padding : 20,
    backgroundColor : '#191919',
    borderColor : '#4915be',
    borderTopLeftRadius : 30,
    borderTopRightRadius : 30,
    borderTopWidth : 3,
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center',
  },
});
