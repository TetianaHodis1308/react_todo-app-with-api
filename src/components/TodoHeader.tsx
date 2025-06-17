import { forwardRef, useEffect } from 'react';
import { ErrorMessage } from '../types/ErrorMessage';
import { createTodos, USER_ID } from '../api/todos';
import { Todo } from '../types/Todo';
import cn from 'classnames';

type TodoHeaderProps = {
  setErrorMessage: React.Dispatch<React.SetStateAction<ErrorMessage>>;
  setTempTodo: React.Dispatch<React.SetStateAction<Todo | null>>;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  isVisibleFooter: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateAllTodo: () => void;
  todos: Todo[];
  newTitle: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
};

export const TodoHeader = forwardRef<HTMLInputElement, TodoHeaderProps>(
  (
    {
      setErrorMessage,
      setTempTodo,
      setTodos,
      isVisibleFooter,
      isLoading,
      setIsLoading,
      handleUpdateAllTodo,
      todos,
      newTitle,
      setTitle,
    },
    inputRef,
  ) => {
    const handleQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedTitle = newTitle.trim();

      if (!trimmedTitle) {
        setErrorMessage(ErrorMessage.WithoutError);

        setTimeout(() => {
          setErrorMessage(ErrorMessage.EmptyTitle);
        }, 0);

        return;
      }

      const newTodo = {
        userId: USER_ID,
        title: trimmedTitle,
        completed: false,
      };

      setTempTodo({ ...newTodo, id: 0 });
      setIsLoading(true);
      createTodos(newTodo)
        .then(newTodoFromServer => {
          setTodos(currentTodo => {
            return [...currentTodo, newTodoFromServer];
          });
          setTempTodo(null);
          setTitle('');
        })
        .catch(() => {
          setErrorMessage(ErrorMessage.UnableAddTodo);
          setTempTodo(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    useEffect(() => {
      if (inputRef && 'current' in inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    }, [inputRef, isLoading]);

    const completedTodo = todos.filter(todo => todo.completed);
    const isActiveToggleAllButton = completedTodo.length === todos.length;

    return (
      <header className="todoapp__header">
        {isVisibleFooter && (
          <button
            type="button"
            className={cn('todoapp__toggle-all', {
              active: isActiveToggleAllButton,
            })}
            data-cy="ToggleAllButton"
            onClick={() => {
              handleUpdateAllTodo();
            }}
          />
        )}

        <form onSubmit={handleSubmit}>
          <input
            data-cy="NewTodoField"
            type="text"
            className="todoapp__new-todo active"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={handleQuery}
            autoFocus
            ref={inputRef}
            disabled={isLoading}
          />
        </form>
      </header>
    );
  },
);

TodoHeader.displayName = 'TodoHeader';
