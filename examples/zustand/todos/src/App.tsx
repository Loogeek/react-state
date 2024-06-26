import { FormEvent } from "react";
import { create } from "zustand";
import { Radio } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { a, useTransition } from "@react-spring/web";

type FilterType = "all" | "completed" | "incomplete";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface Store {
  filter: FilterType;
  todos: Array<Todo>;
  setFilter: (filter: FilterType) => void;
  setTodos: (fn: (todos: Array<Todo>) => Array<Todo>) => void;
}

let keyCount = 0;

const useStore = create<Store>((set) => ({
  filter: "all",
  todos: [],
  setFilter: (filter: FilterType) => {
    set({ filter });
  },
  setTodos: (fn) => {
    set((prev) => ({ todos: fn(prev.todos) }));
  },
}));

function Filter() {
  const { setFilter, filter } = useStore();
  return (
    <Radio.Group onChange={(e) => setFilter(e.target.value)} value={filter}>
      <Radio value="all">All</Radio>
      <Radio value="completed">Completed</Radio>
      <Radio value="incomplete">Incomplete</Radio>
    </Radio.Group>
  );
}

function TodoItem({ item }: { item: Todo }) {
  const { setTodos } = useStore();
  const { completed, id, title } = item;
  const toggleCompleted = () => {
    setTodos((prevTodos) =>
      prevTodos.map((prevTodo) =>
        prevTodo.id === id ? { ...item, completed: !completed } : prevTodo
      )
    );
  };

  const remove = () => {
    setTodos((prevTodos) => prevTodos.filter((prevTodo) => prevTodo.id !== id));
  };

  return (
    <>
      <input type="checkbox" checked={completed} onChange={toggleCompleted} />
      <span style={{ textDecoration: completed ? "line-through" : "" }}>
        {title}
      </span>
      <CloseOutlined onClick={remove} />
    </>
  );
}

function Filtered() {
  const { todos, filter } = useStore();

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "completed") return todo.completed;
    return !todo.completed;
  });

  const transitions = useTransition(filteredTodos, {
    keys: (todo) => todo.id,
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: 40 },
    leave: { opacity: 0, height: 0 },
  });

  return transitions((style, item) => (
    <a.div className="item" style={style}>
      <TodoItem item={item} />
    </a.div>
  ));
}

const App = () => {
  const { setTodos } = useStore();
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = e.currentTarget.inputTitle.value;
    e.currentTarget.inputTitle.value = "";
    setTodos((prevTodos) => [
      ...prevTodos,
      { title, completed: false, id: keyCount++ },
    ]);
  };

  return (
    <form onSubmit={add}>
      <Filter />
      <input name="inputTitle" placeholder="Type ..." />
      <Filtered />
    </form>
  );
};

export default App;
