import cn from 'classnames';
import { Todo } from '../types/Todo';
import React, { useEffect, useRef, useState } from 'react';
import { getUpdateTodo } from '../api/todos';
import { ErrorMessage } from '../types/ErrorMessage';

type TodoItemProps = {
  todo: Todo;
  onDelete?: (todo: Todo) => void;
  isLoading: boolean;
  handleUpdateTodo?: (todoFromInput: Todo) => void;
  setTodos?: React.Dispatch<React.SetStateAction<Todo[]>>;
  setErrorMessage?: React.Dispatch<React.SetStateAction<ErrorMessage>>;
};

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onDelete = () => {},
  isLoading = false,
  handleUpdateTodo = () => {},
  setTodos = () => {},
  setErrorMessage = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(todo?.title || '');
  const [loadingUpdatedTodo, setLoadingUpdatedTodo] = useState(false);
  const todoRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const saveChanges = () => {
    setLoadingUpdatedTodo(true);

    if (todo.title === newTitle) {
      setIsEditing(false);
      setLoadingUpdatedTodo(false);

      return;
    }

    if (newTitle === '') {
      onDelete(todo);
    }

    const toUpdateTodo = { ...todo };

    toUpdateTodo.title = newTitle.trim();

    getUpdateTodo(toUpdateTodo)
      .then(updateTodo => {
        setTodos(currentTodos => {
          return currentTodos.map(currentTodo =>
            currentTodo.id === updateTodo.id ? updateTodo : currentTodo,
          );
        });
        setIsEditing(false);
      })
      .catch(() => setErrorMessage(ErrorMessage.UnableUpdateTodo))
      .finally(() => setLoadingUpdatedTodo(false));
  };

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setNewTitle(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveChanges();
  };

  useEffect(() => {
    if (isEditing && todoRef.current) {
      todoRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
      setLoadingUpdatedTodo(false);
    }
  };

  return (
    <div
      key={todo.id}
      data-cy="Todo"
      className={cn('todo', { 'todo completed': todo.completed })}
      onDoubleClick={() => {
        handleDoubleClick();
      }}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => handleUpdateTodo(todo)}
          aria-label="Toggle todo status"
        />
      </label>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            onChange={handleChangeTitle}
            ref={todoRef}
            onBlur={saveChanges}
            onKeyUp={handleKeyUp}
          />
        </form>
      ) : (
        <span data-cy="TodoTitle" className="todo__title">
          {todo.title}
        </span>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': isLoading || loadingUpdatedTodo,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>

      {!isEditing && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => onDelete(todo)}
          disabled={isLoading}
        >
          ×
        </button>
      )}
    </div>
  );
};
