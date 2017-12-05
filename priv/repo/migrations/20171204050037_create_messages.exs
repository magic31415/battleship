defmodule Battleship.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do

		add :content, :string, null: false
		add :username, :string, null: false
		add :table_id, references(:tables, on_delete: :delete_all), null: false

      timestamps()
    end

  end
end
