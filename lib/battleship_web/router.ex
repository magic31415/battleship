defmodule BattleshipWeb.Router do
  use BattleshipWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    # plug :set_user
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", BattleshipWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  # Other scopes may use custom stacks.
  # scope "/api", BattleshipWeb do
  #   pipe_through :api
  # end

  # From Nat Tuck's Hangman
  # def set_user(conn, _params) do
  #   user  = ""
  #   token = Phoenix.Token.sign(BattleshipWeb.Endpoint, "username", user)
  #   conn
  #   |> assign(:user_name,  user)
  #   |> assign(:user_token, token)
  # end
end
