---
layout: post
title: QUIC Game Protocol
date: 2025-06-01
summary: >
    A QUIC Protocol demonstration which uses a custom application layer protocol to send messages between terminals using QUIC
---

# Description  
QGP.py is a script which supports a proof-of-concept (POC) implementation of the Quick Game Protocol over QUIC.
In brief, the script defines the PDU and DFA, as well as common class definitions in pdu.py and connectionContext.py.
With QGP running on two separate terminals, server and client, the script is designed to send communications from one terminal
to another using QUIC transport.  This state-based protocol uses fixed Protocol Data Units (PDU) to progress through
the Deterministic Finite Automata (DFA) in structured fashion. The active state of the DFA allows for ongoing communications
between server and client to support an interactive gaming interface.  The connection persists until client or server request
termination.

As proof of concept, QGP was configured to support a minimal implementation of the game Othello.  Information about game
rules and valid moves can easily be found elsewhere and are generally not within the scope of the POC for QGP. The game
states are send from the server with each new iteration, while user inputs are sent from the client. 

# Purpose
QUIC is a novel transport layer protocol with many benefits over TCP/IP and simple UDP. QUIC supports stream multiplexing and built-in encryption, among other features. This project is an implementation of a custom, application-layer protocol built over QUIC to leverage these benefits as proof of concept. 

# Methods  
I implemented a state-aware application layer protocol which tracks and maintains a network connection between client and server. For fun, I integrated a minimal build of the game Othello to give the client a more interactive experience.

# Features  
## Game Coordinates
The coordinate system of the game board is zero-indexed, starting in the top left corner and moving top->bottom and left->right
Moves are listed in y,x order so:

Move x to 0,1 corresponds to:  

```bash
........  
x.......  
........  
........  
........  
........  
........  
........  
```

and 

Move x to 5,3 corresponds to:  

```bash
........  
........  
........  
........  
........  
...x....  
........  
........  
```  

# Examples  

<div style="display: flex; flex-direction: column; gap: 2em; align-items: center;">

  <!-- Row 1 -->
  <div style="display: flex; gap: 2em; justify-content: center; flex-wrap: wrap;">
    <div>
      <img src="/screenshots/c1.png" alt="Client 1" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Client - Step 1</p>
    </div>
    <div>
      <img src="/screenshots/s1.png" alt="Server 1" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Server - Step 1</p>
    </div>
  </div>

  <!-- Row 2 -->
  <div style="display: flex; gap: 2em; justify-content: center; flex-wrap: wrap;">
    <div>
      <img src="/screenshots/c2.png" alt="Client 2" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Client - Step 2</p>
    </div>
    <div>
      <img src="/screenshots/s2.png" alt="Server 2" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Server - Step 2</p>
    </div>
  </div>

  <!-- Row 3 -->
  <div style="display: flex; gap: 2em; justify-content: center; flex-wrap: wrap;">
    <div>
      <img src="/screenshots/c3.png" alt="Client 3" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Client - Step 3</p>
    </div>
    <div>
      <img src="/screenshots/s3.png" alt="Server 3" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Server - Step 3</p>
    </div>
  </div>

  <!-- Row 4 -->
  <div style="display: flex; gap: 2em; justify-content: center; flex-wrap: wrap;">
    <div>
      <img src="/screenshots/c4.png" alt="Client 4" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Client - Step 4</p>
    </div>
    <div>
      <img src="/screenshots/s4.png" alt="Server 4" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Server - Step 4</p>
    </div>
  </div>

  <!-- Row 5 -->
  <div style="display: flex; gap: 2em; justify-content: center; flex-wrap: wrap;">
    <div>
      <img src="/screenshots/c5.png" alt="Client 5" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Client - Step 5</p>
    </div>
    <div>
      <img src="/screenshots/s5.png" alt="Server 5" style="width: 100%; max-width: 400px;">
      <p style="text-align: center;">Server - Step 5</p>
    </div>
  </div>

</div>

# Results and Conclusion
The program is a demonstration of a state-aware application layer protocol implementation over QUIC

## Proof of Concept
This POC is meant to prove that GCP is capable of supporting game state messages across a network.  This is not a deployment-ready
implementation.  Note that login authentication, in its current state, will accept and confirm any username or password string sent 
from the client.  Futhermore, certifications were taken from those provided by course instructor and are set to be ignored by
QUIC TLS.  The program contains no security implementations and would be particularly vulnerable to DDOS attack unless the
activity would be detected and mitigated via QUIC. Finally, the port number is bound to 12345 for both server and client, and 
the gameName is hardcoded to support only the Othello game.  The server is designed to never close except by interrupt
or killing the terminal; a deployment-ready implementation should provide a way to close the server.

# Future Work and Extension  
The program is designed with several future extensions in mind. With minor changes, QGP can be extended to support multiple games
or persistent connection to support repeated playthroughs of the same game. The send_protocol_error method can be extended for
resend requests of invalid messages, or valid packages received during the incorrect connection state.  Another obvious extension
is to allow the client to choose difficulty levels. Othello contains multiple different AI models which vary in complexity. Some
of the models are likely to outperform most novice Othello players.  I selected a model which performs well-enough to be
challenging to defeat.

# References  
No external sources were used. However, LLM queries assisted with architectural design and debugging.  

# Contributing  
Code architecture was built over a minimal template which was provided to me by Drexel University during Graduate studies in 2025.

# Licenses  
None

<a href="https://github.com/dmeverly/quic-game-protocol" style="display: block; text-align:right;" target = "_blank">  Github Repo -> </a>