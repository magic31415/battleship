defmodule Battleship.Game.Table do
  use Ecto.Schema
  import Ecto.Changeset
  alias Battleship.Game.Table


  schema "tables" do

    timestamps()
  end

  @doc false
  def changeset(%Table{} = table, attrs) do
    table
    |> cast(attrs, [])
    |> validate_required([])
  end
end
