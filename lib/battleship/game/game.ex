defmodule Battleship.Game do
  import Ecto.Query, warn: false
  alias Battleship.Repo
  alias Battleship.Game.Table
  alias Battleship.Game.Message

  # Database ==================================================================

  # TABLE
	def create_table(attrs \\ %{}) do
	  %Table{}
	  |> Table.changeset(attrs)
	  |> Repo.insert()
	end

	def get_latest_table!() do
    Repo.one(from t in Table, order_by: [desc: t.inserted_at], limit: 1)
  end

  def get_table(id), do: Repo.get(Table, id)

  # MESSAGE
  def create_message(attrs \\ %{}) do
	  %Message{}
	  |> Message.changeset(attrs)
	  |> Repo.insert()
	end

	def list_messages_for_table(table_id) do
    t_id = to_string(table_id)
    query = from m in Message,
            where: m.table_id == ^t_id,
            order_by: [desc: m.inserted_at],
            select: m

    messages = Enum.map(Repo.all(query), &Map.take(&1, [:content, :username]))

    # From https://elixirforum.com/t/transform-a-list-into-an-map-with-indexes-using-enum-module/1523/2
		1..length(messages) |> Stream.zip(messages) |> Enum.into(%{})
  end

  # ===========================================================================

  # def new do
  #   %{
  #     word: next_word(),
  #     guesses: [],
  #   }
  # end

  # def client_view(game) do
  #   ws = String.graphemes(game.word)
  #   gs = game.guesses
  #   %{
  #     skel: skeleton(ws, gs),
  #     goods: Enum.filter(gs, &(Enum.member?(ws, &1))),
  #     bads: Enum.filter(gs, &(!Enum.member?(ws, &1))),
  #     max: max_guesses(),
  #   }
  # end

  # def skeleton(word, guesses) do
  #   Enum.map word, fn cc ->
  #     if Enum.member?(guesses, cc) do
  #       cc
  #     else
  #       "_"
  #     end
  #   end
  # end

  # def guess(game, letter) do
  #   if letter == "z" do
  #     raise "That's not a real letter"
  #   end

  #   gs = game.guesses
  #   |> MapSet.new()
  #   |> MapSet.put(letter)
  #   |> MapSet.to_list

  #   Map.put(game, :guesses, gs)
  # end

  # def max_guesses do
  #   12
  # end

  # def next_word do
  #   words = ~w(
  #     dog cat horse frog snake
  #     muffin cookie pizza sandwich
  #     house car train clock
  #     parsnip marshmallow
  #   )
  #   Enum.random(words)
  # end
end
