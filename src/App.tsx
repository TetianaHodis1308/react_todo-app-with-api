import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { deleteTodos, getTodos, getUpdateTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { TodoFilters } from './types/TodoFilters';
import { ErrorMessage } from './types/ErrorMessage';
import { ErrorNotification } from './components/ErrorNotification';
import { TodoList } from './components/TodoList';
import { TodoHeader } from './components/TodoHeader';
import { TodoFooter } from './components/TodoFooter';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.WithoutError,
  );
  const [todoFilter, setTodoFilter] = useState<TodoFilters>(TodoFilters.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [todoIdsToDelete, setTodoIdsToDelete] = useState<number[]>([]);

  const isVisibleFooter = todos.length !== 0;
  const inputRef = useRef<HTMLInputElement>(null);
  const [todoIdsToUpdate, setTodoIdsToUpdate] = useState<number[]>([]);

  useEffect(() => {
    setIsLoading(true);
    getTodos()
      .then(todosFromServer => {
        setTodos(todosFromServer);
      })
      .catch(() => setErrorMessage(ErrorMessage.UnableLoadTodos))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (errorMessage) {
      timer = setTimeout(() => {
        setErrorMessage(ErrorMessage.WithoutError);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleDeleteTodo = (todo: Todo) => {
    setTodoIdsToDelete(prev => [...prev, todo.id]);

    deleteTodos(todo.id)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(currentTodo => currentTodo.id !== todo.id),
        );
      })
      .catch(() => {
        setErrorMessage(ErrorMessage.WithoutError);
        setTimeout(() => {
          setErrorMessage(ErrorMessage.UnableDeleteTodo);
        }, 0);
      })
      .finally(() => {
        setTodoIdsToDelete(prev => prev.filter(id => id !== todo.id));
        inputRef.current?.focus();
      });
  };

  const handleUpdateTodo = (todoFromInput: Todo) => {
    const toUpdateTodo = { ...todoFromInput };

    toUpdateTodo.completed = !toUpdateTodo.completed;

    setTodoIdsToUpdate(prev => [...prev, toUpdateTodo.id]);

    getUpdateTodo(toUpdateTodo)
      .then(updateTodo => {
        setTodos(currentTodos => {
          return currentTodos.map(currentTodo =>
            currentTodo.id === updateTodo.id ? updateTodo : currentTodo,
          );
        });
      })
      .catch(() => setErrorMessage(ErrorMessage.UnableUpdateTodo))
      .finally(() => {
        setTodoIdsToUpdate(prev => prev.filter(id => id !== toUpdateTodo.id));
      });
  };

  const handleUpdateAllTodo = () => {
    const activeTodo = todos.filter(todo => !todo.completed);

    if (activeTodo.length > 0) {
      todos.forEach(todo => {
        if (!todo.completed) {
          handleUpdateTodo(todo);
        }
      });
    } else {
      todos.forEach(todo => {
        handleUpdateTodo(todo);
      });
    }
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <TodoHeader
          setErrorMessage={setErrorMessage}
          setTempTodo={setTempTodo}
          setTodos={setTodos}
          isVisibleFooter={isVisibleFooter}
          ref={inputRef}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleUpdateAllTodo={handleUpdateAllTodo}
          todos={todos}
          newTitle={title}
          setTitle={setTitle}
        />

        {todos.length > 0 && (
          <>
            <TodoList
              todos={todos}
              todoFilter={todoFilter}
              todoIdsToDelete={todoIdsToDelete}
              handleDeleteTodo={handleDeleteTodo}
              tempTodo={tempTodo}
              todoIdsToUpdate={todoIdsToUpdate}
              handleUpdateTodo={handleUpdateTodo}
              setTodos={setTodos}
              setErrorMessage={setErrorMessage}
            />

            {isVisibleFooter && (
              <TodoFooter
                todos={todos}
                todoFilter={todoFilter}
                setTodoFilter={setTodoFilter}
                handleDeleteTodo={handleDeleteTodo}
              />
            )}
          </>
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        onSetErrorMessage={setErrorMessage}
      />
    </div>
  );
};
