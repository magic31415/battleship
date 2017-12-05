defmodule BattleshipWeb.TableChannel do
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

  def list_messages(table_id) do
    Game.list_messages_for_table(table_id)
  end

  def handle_in("message", payload, socket) do
    Game.create_message(payload)
    messages = list_messages(payload["table_id"])
    broadcast socket, "message", messages
    {:noreply, socket}
  end

  def handle_in("init", payload, socket) do
    messages = list_messages(payload["table_id"])
    {:reply, {:ok, messages}, socket}
  end

  def handle_in("send_challenge", payload, socket) do
    broadcast socket, "send_challenge", payload
    {:noreply, socket}
  end

  def handle_in("respond_challenge", payload, socket) do
    broadcast socket, "respond_challenge", payload
    {:noreply, socket}
  end
end
