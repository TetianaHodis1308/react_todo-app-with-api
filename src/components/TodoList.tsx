import { ErrorMessage } from '../types/ErrorMessage';
import { Todo } from '../types/Todo';
import { TodoFilters } from '../types/TodoFilters';
import { getVisibleTodos } from '../utils/getVisibleTodos';
import { TodoItem } from './TodoItem';

type TodoListProps = {
  todos: Todo[];
  todoFilter: TodoFilters;
  todoIdsToDelete: number[];
  handleDeleteTodo: (todo: Todo) => void;
  tempTodo: Todo | null;
  todoIdsToUpdate: number[];
  handleUpdateTodo: (todoFromInput: Todo) => void;
  setTodos?: React.Dispatch<React.SetStateAction<Todo[]>>;
  setErrorMessage?: React.Dispatch<React.SetStateAction<ErrorMessage>>;
};

export const TodoList = ({
  todos,
  todoFilter,
  todoIdsToDelete,
  handleDeleteTodo,
  tempTodo,
  todoIdsToUpdate,
  handleUpdateTodo,
  setTodos,
  setErrorMessage,
}: TodoListProps) => {
  const visibleTodos: Todo[] = getVisibleTodos(todos, todoFilter);

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {visibleTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isLoading={
            todoIdsToDelete.includes(todo.id) ||
            todoIdsToUpdate.includes(todo.id)
          }
          onDelete={handleDeleteTodo}
          handleUpdateTodo={handleUpdateTodo}
          setTodos={setTodos}
          setErrorMessage={setErrorMessage}
        />
      ))}
      {tempTodo && <TodoItem todo={tempTodo} isLoading={true} />}
    </section>
  );
};
