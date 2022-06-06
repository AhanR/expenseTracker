import { useState, useEffect, useReducer } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Pressable, SafeAreaView, TextInput } from 'react-native';
import * as FileSystem from 'expo-file-system'

export default function App() {

  const [items, setItems] = useState(0);
  const [editor, setEditor] = useState({ open: false, key: 0 });
  const [expenses, setExpenses] = useReducer((state, action) => {
    if (action.action == 1) {
      let i = 0
      while (i < state.length) {
        if (state[i].key == action.key) {
          state[i] = { item: action.data, cost: state[i].cost, key: action.key, v: parseInt(state[i].v) + 1, date : state[i].date };
        }
        i++;
      }
    }
    else if (action.action == 0) {
      let i = 0
      while (i < state.length) {
        if (state[i].key == action.key) {
          state[i] = { item: state[i].item, cost: action.data, key: action.key, v: parseInt(state[i].v) + 1, date : state[i].date };
        }
        i++;
      }
    }
    else if (action.action == 2) {
      for (let i = 0; i < state.length; i++) if (state[i].key == action.data.key) return state;
      state.push(action.data);
    }
    else if(action.action == 3) {
      let i = 0;
      for(; i < state.length; i++) if(state[i].key == action.key) {
        state.splice(i,1)
        return state;
      }
    }

    return state;
  }, []);
  
  function read(key) {
    let i = 0;
    for (; i < expenses.length; i++) if (expenses[i].key == key) return expenses[i];
    return null;
  }

  useEffect(() => {
    FileSystem.writeAsStringAsync(expenses)
    console.log("written to cache");
  }, [expenses])

  const cacheDir = FileSystem.cacheDirectory+"AppState";
  FileSystem.getInfoAsync(cacheDir).then(fileInfo => {
    if(fileInfo.exists) {
      FileSystem.readAsStringAsync(cacheDir).then(data => {
        console.log(data.data);
      })
    }
  });

  function saveFile() {
    let state = expenses.reduce((p,a)=> {
      return p + "\n" + JSON.stringify(a)
    },"")
    console.log(state);
    FileSystem.writeAsStringAsync(state)
    console.log("written to cache");
  }

  return (
    <SafeAreaView
      style={{
        height : '100%',
      }}
    >
      <StatusBar
        showHideTransition='slide'
        animated={true}
        backgroundColor={`${colours.highlight}`}
        barStyle='light-content'
      />
      <View
        style={styles.body}
      >
        <ScrollView
          style={[styles.scroller]}
        >

          {expenses.map(expense => {
            return (
              (!expense) ? <></> :
              <Expense
                item={expense.item}
                cost={expense.cost}
                key={`${expense.key}.${expense.v}`}
                id={expense.key}
                date={expense.date}
                setEdit={setEditor}
              />
            );
          })}

        </ScrollView>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap : 'wrap',
            justifyContent: 'space-between',
            backgroundColor: colours.background,
            shadowRadius : 40,
            shadowColor : colours.background,
            zIndex : 2,
          }}
        >
          <View
            style={{
              width : '100%',
              display : 'flex',
              flexDirection : 'row',
              justifyContent : 'space-between',
              padding : 20,
              paddingBottom : 10,
            }}
          >
            <Text
              style={styles.boldText}
            >Total expenditure</Text>
            <Text
              style={styles.boldText}
            >₹{expenses.reduce((e,a) => e + a.cost, 0)}</Text>
          </View>
          <Btn
            style={[styles.button, styles.primary]}
            textStyle={[styles.whiteText]}
            title="Add Expense"
            onPress={() => {
              setExpenses({ data: { item: 'Untitled-' + items, cost: 0, key: items, v: 0, date : (new Date()).toLocaleDateString() }, action: 2 })
              setEditor({ open: true, key: items });
              setItems(items + 1);
            }}
          />
        </View>
        <Popup
          open={editor}
          opener={setEditor}
          setExpenses={setExpenses}
          read={read}
          saveFile = {saveFile}
        />
      </View>
    </SafeAreaView>
  );
}

const Btn = (props) => {
  return (
    <Pressable
      style={props.style}
      onPress={props.onPress}
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
      <View>
        <Text style={[styles.whiteText]}>{item}</Text>
        <Text style={[{
          color: '#aaa',
          fontSize : 10,
          // fontFamily : 'Inter-Black',
        }]}>{props.date}</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Text style={[styles.whiteText]}>₹{cost}</Text>
        <Btn
          style={{
            marginLeft: 20,
            borderRadius: 10,
            minHeight: 10,
          }}

          textStyle={{
            color: 'white',
          }}

          title="Edit"

          onPress={() => {
            props.setEdit({ open: true, key: props.id })
          }}
        />
      </View>
    </View>
  )
}

const Popup = (props) => {
  let itemSaveTimer;
  let costSaveTimer;
  let editItem = props.read(props.open.key);

  useEffect(() => {
    setLocalKey(props.open.key);
    editItem = props.read(props.open.key);
    setItemName((editItem && editItem.item) || 'untitled');
    setItemCost((editItem && editItem.cost) || 0);
  }, [props.open]);

  const [localKey, setLocalKey] = useState(parseInt(props.open.key));

  const [itemName, setItemName] = useState((editItem && editItem.item) || 'untitled');
  const [itemCost, setItemCost] = useState((editItem && editItem.cost) || 0);

  return (
    (props.open.open) ? <View
      style={styles.modal}
    >
      <View
        style={{
          width: '80%',
          alignItems: 'center',
        }}
      >
        <TextInput
          style={styles.input}
          placeholder="add item name"
          value={itemName}
          onChangeText={(text) => {
            setItemName(text);
            clearTimeout(itemSaveTimer);
            itemSaveTimer = setTimeout(() => {
              props.setExpenses({ action: 1, data: text, key: localKey });
            }, 400);
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="add item cost"
          value={`${itemCost}`}
          keyboardType="number-pad"
          onChangeText={(text) => {
            setItemCost(text);
            clearTimeout(costSaveTimer);
            costSaveTimer = setTimeout(() => {
              props.setExpenses({ action: 0, data: parseInt(text) || 0, key: localKey });
            }, 400);
          }}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            width : '100%',
            justifyContent : 'space-between',
          }}
        >
          <Btn
            style={styles.doneButton}
            textStyle={{
              color: colours.highlight,
              fontWeight: '700',
              // fontFamily : 'Inter-Black',
            }}
            title="Remove Expense"
            onPress={() => {
              props.setExpenses({action : 3, data : '', key : localKey });
              props.opener({open : false, key : 0});
              props.saveFile();
            }}
          />
          <Btn
            title="done"
            style={[styles.doneButton, styles.primary]}
            onPress={() => {
              props.opener({ open: false, key: localKey })
            }}
          />
        </View>
      </View>
    </View> : <></>
  )
}

const colours = {
  highlight: '#723eea',
  background: '#191919',
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colours.background,
    paddingTop: 30,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    margin: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colours.highlight,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colours.highlight,
  },
  scroller: {
    flex: 1,
    width: '100%',
    backgroundColor: colours.background,
  },
  expense: {
    flex: 1,
    padding: 30,
    margin: 10,
    maxHeight: 100,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: colours.highlight,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colours.background,
    color: 'white',
  },
  input: {
    marginBottom: 20,
    padding: 10,
    width: '100%',
    color: 'white',
    borderBottomColor: colours.highlight,
    borderBottomWidth: 1,
    backgroundColor: '#505050',
    borderRadius: 10,
    // fontFamily : 'Inter-Black',
  },
  doneButton: {
    padding: 10,
    width: '48%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor : colours.highlight,
    alignItems: 'center',
  },
  modal: {
    position: 'absolute',
    bottom : '0%',
    left: 0,
    width: '100%',
    height: '80%',
    zIndex: 2,
    padding: 20,
    backgroundColor: colours.background,
    borderColor: colours.highlight,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 2,
    borderBottomWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText : {
    color : 'white',
    fontWeight : '700',
    fontSize : 20,
    // fontFamily : 'Inter-Black',
  },
  whiteText : {
    color: 'white',
    fontWeight : '500',
    // fontFamily : 'Inter-Black',
  },
});
