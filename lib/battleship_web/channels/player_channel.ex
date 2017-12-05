defmodule BattleshipWeb.PlayerChannel do
  use BattleshipWeb, :channel
  alias Battleship.Game

  def join(chan, payload, socket) do
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end

  def handle_in("createTable", payload, socket) do
    Game.create_table
    {:reply, {:ok, Map.put(payload, :table_id, Game.get_latest_table!.id)}, socket}
  end

  def handle_in("joinTable", payload, socket) do
    if Game.get_table(payload["table_id"]) do
      {:reply, {:ok, payload}, socket}
    else
      {:reply, {:error, %{msg: "Table not found"}}, socket}
    end
  end
end
