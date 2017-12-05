defmodule Battleship.Game.Message do
  use Ecto.Schema
  import Ecto.Changeset
  alias Battleship.Game.Message


  schema "messages" do
    field :content, :string
    field :username, :string
    belongs_to :table, Battleship.Game.Table

    timestamps()
  end

  @doc false
  def changeset(%Message{} = message, attrs) do
    message
    |> cast(attrs, [:content, :username, :table_id])
    |> validate_required([:content, :username, :table_id])
  end
end
