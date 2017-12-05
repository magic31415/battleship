import React from 'react';
import socket from "./socket"

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.state;
    this.channel = this.props.channel;
  }

  // join_named_channel(name) {
  //   // this.channel.close();
  //   let chan = socket.channel("player:" + name, {});
  //   chan.join()
  //     .receive("ok", state0 => { console.log("Joined named successfully", state0);
  //                                this.setState({channel: chan}) })
  //     .receive("error", resp => { console.log("Unable to join", resp) });
  // }

  join_chat_channel(table_id) {
    let chan = socket.channel("table:" + table_id, {});
    chan.join()
      .receive("ok", resp => { console.log("Joined Chat #" + table_id, resp);
                               this.setState({chatChannel: chan});

                               chan.on("message", this.got_message.bind(this));
                               chan.on("send_challenge", this.got_challenge.bind(this));
                               chan.on("respond_challenge", this.got_challenge_response.bind(this));

                               this.state.chatChannel.push("init", {table_id: this.state.table_id})
                                 .receive("ok", this.got_message.bind(this)); })
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  new_table() {
    return (function() {
      let name = $('#name-field').val();

      if (name == "") {
        console.log("no name");
      }
      else {
        console.log("new table for " + name);
        // window.username = name;
        this.channel.push("createTable", {name: name})
          .receive("ok", state => { this.setState(state);
                                    this.join_chat_channel(this.state.table_id);
                                    /*this.join_named_channel(name).bind(this)*/ })
          .receive("error", resp => { console.log("Unable to join", resp) });
      }
    });
  }

  join_table() {
    return (function() {
      let name = $('#name-field').val();
      let table_id = $('#table-id-field').val();

      if (name == "") {
        console.log("no name");
      }
      else if (table_id == "") {
        console.log("no id");
      }
      else {
        // window.username = name;
        this.channel.push("joinTable", {name: name, table_id: table_id})
          .receive("ok", state => { this.setState(state);
                                    this.join_chat_channel(this.state.table_id);
                                    /*this.join_named_channel(name).bind(this)*/ })
          .receive("error", resp => console.log(resp.msg));
      }
    });
  }

  post_message() {
    return (function() {
      let content = $('#message-field').val();
      let chat_room = $('#chat-room');

      if(content != "") {
        this.state.chatChannel.push("message", {content: content,
                                                username: this.state.name,
                                                table_id: this.state.table_id});
        $('#message-field').val("");
      }
    });
  }

  got_message(msg) {
    // From https://stackoverflow.com/a/6857636
    let messages = $.map(msg, function(value, index) { return [value.username] + " : " + [value.content] })
    this.setState({messages: messages});
  }

  // TODO cant do any of this while playing

  // TODO prevent challenging self

  send_challenge() {
    return (function() {
      let opponent = $('#challenge-field').val();

      if(opponent != "") {
        this.setState({challenging: true,
                       challenged: false,
                       opponent: opponent});
        $('#challenge-field').val("");
        
        this.state.chatChannel.push("send_challenge",
                                    {table_id: this.state.table_id,
                                     username: this.state.name,
                                     opponent: opponent,
                                     challenging: true});
      }
    });
  }

  cancel_challenge() {
    return (function() {
      this.state.chatChannel.push("send_challenge",
                                  {table_id: this.state.table_id,
                                   username: this.state.name,
                                   opponent: this.state.opponent,
                                   challenging: false});

      this.setState({challenging: false,
                     opponent: ""});
    }); 
  }

  got_challenge(msg) {
    if((msg["table_id"] != this.state.table_id)
      || (msg["opponent"] != this.state.name)) {
      return;
    }
    else if(this.state.challenging || this.state.playing) {
      // respond no
      return;
    }
    else if(msg["challenging"]) {
        this.setState({challenged: true, opponent: msg["username"]});
    }
    else {
      this.setState({challenged: false, opponent: ""});
    }
  }

  respond_challenge(response) {
    return (function() {
      this.setState({challenged: false,
                     playing: response});

      if(response) {
        this.setState({total_pegs: 0});
        this.setState({pegs_left_in_ship: this.get_ship_size(),
                       last_cell_num: -1});
      }

      this.state.chatChannel.push("respond_challenge",
                                  {table_id: this.state.table_id,
                                   username: this.state.name,
                                   opponent: this.state.opponent,
                                   response: response});
    })
  }

  got_challenge_response(msg) {
    if((msg["table_id"] != this.state.table_id)
      || (msg["opponent"] != this.state.name)) {
      return;
    }
    else if(msg["username"] != this.state.opponent) {
      console.log("Error: response to another opponent");
    }
    else if(msg["response"]) {
      this.setState({total_pegs: 0});
      this.setState({pegs_left_in_ship: this.get_ship_size(),
                     last_cell_num: -1,
                     challenging: false,
                     playing: true});
    }
    else {
      this.setState({challenging: false, opponent: ""});
    }
  }

  gen_challenge_html() {
    if (this.state.challenging && this.state.challenged) {
      console.log("Error: challenging and challenged");
      return "";
    }
    else if(this.state.challenging) {
      return <div>
               Challenging {this.state.opponent}...
               <button id="cancel_challenge_button"
                       className="btn btn-warning ml-2"
                       onClick={this.cancel_challenge().bind(this)}>Cancel Request</button>
             </div>;
    }
    else if(this.state.challenged) {
      return <div>
               New challenge from {this.state.opponent}!
               <button id="accept_challenge_button"
                       className="btn btn-success ml-2 mr-2"
                       onClick={this.respond_challenge(true).bind(this)}>Accept Request</button>
               <button id="decline_challenge_button"
                       className="btn btn-danger"
                       onClick={this.respond_challenge(false).bind(this)}>Decline Request</button>
             </div>;
    }
    else if(this.state.playing) {
      return <h1>You are playing {this.state.opponent}</h1>;
    }
    else {
      return <div>
               <h4 className="float-left mr-2">Challenge</h4>
               <input type="text"
                      placeholder="Enter opponent's name"
                      className="form-control skinny ml-2"
                      id="challenge-field"
                      name="challenge" />
                <h4 className="float-left mt-3">to a game of battleship!</h4>
               <button id="challenge-button"
                       className="mt-3 mb-3 ml-2 btn btn-secondary"
                       onClick={this.send_challenge().bind(this)}>Send Challenge</button>
             </div>;
    }
  }

  select_cell(cell_num, player_num) {
    return (function() {
      let total_pegs = this.state.total_pegs;
      let pegs_left_in_ship = this.state.pegs_left_in_ship;

      // console.log("total_pegs: ", total_pegs, "pegs_left_in_ship: ", this.state.pegs_left_in_ship)

      if(player_num == 1 && total_pegs < 17 && this.is_valid_place(cell_num)) {
        $('#button-' + player_num + '-' + cell_num).toggleClass("selected-cell");
        // console.log(this.state.total_pegs, this.state.pegs_left_in_ship);
        this.setState({total_pegs: total_pegs + 1,
                       pegs_left_in_ship: pegs_left_in_ship - 1});
        pegs_left_in_ship = pegs_left_in_ship - 1;
        console.log(pegs_left_in_ship);

        // console.log("after thing pegs_left_in_ship", this.state.pegs_left_in_ship)
        if(pegs_left_in_ship == 0) {
          // console.log("reset");
          this.setState({pegs_left_in_ship: this.get_ship_size(),
                         last_cell_num: -1});
        }
        else {
          this.setState({last_cell_num: cell_num});
        }
      }
      else {
        console.log("can't select yet");
        // console.log("player: ", player_num, "total_pegs: ", total_pegs, "cell_num: ", cell_num, "last: ", this.state.last_cell_num, "pegs_left_in_ship: ", this.state.pegs_left_in_ship)
      }
    })
  }

  gen_cells(row_num, player_num) {
    let cells = [];

    for (let j = 0; j < 10; j++) {
      let cell_num = row_num * 10 + j;
      cells.push(<td key={'cell-' + player_num + '-' + cell_num}
                        id={'cell-' + player_num + '-' + cell_num}>
                      <button className="board-cell"
                              key={'button-' + player_num + '-' + cell_num}
                              id={'button-' + player_num + '-' + cell_num}
                              onClick={this.select_cell(cell_num, player_num).bind(this)}></button>
                    </td>); 
    }
    return cells;
  }

  is_valid_place(cell_num) {
    let last_cell_num = this.state.last_cell_num;
    let distance = Math.abs(cell_num - last_cell_num);
    return ((last_cell_num == -1) || distance == 1 || distance == 10);
    // TODO more rules for overlap, same direction
  }

  get_ship_msg() {
    let size = this.get_ship_size();

    if(size == 0) {
      return "All ships placed";
    }
    else {
      return "Place a ship of length " + size;
    }
  }

  get_ship_size() {
    let total_pegs = this.state.total_pegs;

    if(total_pegs < 5) {
      return 5;
    }
    else if(total_pegs < 9) {
      return 4;
    }
    else if(total_pegs < 15) {
      return 3;
    }
    else if(total_pegs < 17) {
      return 2;
    }
    else {
      return 0;
    }
  }

  gen_boards_html() {
    if(!this.state.playing) {
      return <h1>No current game</h1>;
    }
    else {
      let rows_p1 = [];
      let rows_p2 = []
      for (let i = 0; i < 10; i++) {
        rows_p1.push(<tr key={"row-p1" + i}>{this.gen_cells(i, 1)}</tr>);
        rows_p2.push(<tr key={"row-p2" + i}>{this.gen_cells(i, 2)}</tr>);
      }

      return <div>
               <h1>{this.get_ship_msg()}</h1>
               <table id="my-table" className="bs-table"><tbody>{rows_p1}</tbody></table>
               <table id="other-table" className="bs-table"><tbody>{rows_p2}</tbody></table>
             </div>;
    }
  }

  render() {
    if(this.state.table_id) {
      let messages = ""
      if(this.state.messages) {
        messages = this.state.messages.map((msg) => <li>{msg}</li>);
      }
      return(
        <div>
          <h2 className="float-left mr-3">Table ID: {this.state.table_id}</h2>
          <h2 className="mb-5">User: {this.state.name}</h2>
          <div id="challenge">{this.gen_challenge_html()}</div>
          <div id="boards">{this.gen_boards_html()}</div>
          <div id="chat-room">
            <input type="text"
                   className="form-control mr-2 mt-3 mb-5 skinny float-left"
                   placeholder="Send a message in the chat"
                   id="message-field"
                   name="message" />
            <button id="post-message-button"
                    className="btn btn-secondary mt-3"
                    onClick={this.post_message().bind(this)}>Post Message</button>
            <ul>{messages}</ul>
          </div>
        </div>
      );
    }
    else {
      return (
        <div>
          <div id="join-table-form">
            <input type="text"
                   placeholder="Enter your name"
                   className="form-control mb-4 skinny"
                   id="name-field"
                   name="name" />

            <h4>and</h4>

            <button className="mb-5 float-left btn btn-secondary"
                    id="new-table-button"
                    onClick={this.new_table().bind(this)}>Create a New Table</button>

            <h4 className="float-left ml-2 mr-2">or</h4>

            <input type="text"
                   placeholder="Enter Table ID for existing table"
                   className="form-control skinny float-left mr-2"
                   id="table-id-field"
                   name="table-id" />

            <button id="join-table-button"
                    className="float-left btn btn-secondary"
                    onClick={this.join_table().bind(this)}>Join an Existing Table</button>
          </div>

          <div id="game"></div>
        </div>
      );
    }
  }
}
