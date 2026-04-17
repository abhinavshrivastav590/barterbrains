import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import SessionTypes "../types/sessions";
import CommonTypes "../types/common";

module {
  public func toPublic(self : SessionTypes.Session) : SessionTypes.SessionPublic {
    {
      id = self.id;
      requesterId = self.requesterId;
      receiverId = self.receiverId;
      topic = self.topic;
      scheduledAt = self.scheduledAt;
      status = self.status;
      message = self.message;
      createdAt = self.createdAt;
    };
  };

  public func requestSession(
    sessions : List.List<SessionTypes.Session>,
    nextId : Nat,
    requester : CommonTypes.UserId,
    input : SessionTypes.SessionRequest,
  ) : SessionTypes.SessionPublic {
    let session : SessionTypes.Session = {
      id = nextId;
      requesterId = requester;
      receiverId = input.receiverId;
      topic = input.topic;
      scheduledAt = input.scheduledAt;
      var status = #pending;
      message = input.message;
      createdAt = Time.now();
    };
    sessions.add(session);
    toPublic(session);
  };

  public func respondToSession(
    sessions : List.List<SessionTypes.Session>,
    caller : CommonTypes.UserId,
    sessionId : CommonTypes.SessionId,
    accept : Bool,
  ) : SessionTypes.SessionPublic {
    let session = switch (sessions.find(func(s : SessionTypes.Session) : Bool { Nat.equal(s.id, sessionId) })) {
      case (?s) s;
      case null Runtime.trap("Session not found");
    };
    if (not Principal.equal(session.receiverId, caller)) {
      Runtime.trap("Only the receiver can respond to a session request");
    };
    session.status := if (accept) #confirmed else #rejected;
    toPublic(session);
  };

  public func completeSession(
    sessions : List.List<SessionTypes.Session>,
    caller : CommonTypes.UserId,
    sessionId : CommonTypes.SessionId,
  ) : SessionTypes.SessionPublic {
    let session = switch (sessions.find(func(s : SessionTypes.Session) : Bool { Nat.equal(s.id, sessionId) })) {
      case (?s) s;
      case null Runtime.trap("Session not found");
    };
    let isParticipant = Principal.equal(session.requesterId, caller) or Principal.equal(session.receiverId, caller);
    if (not isParticipant) {
      Runtime.trap("Only participants can complete a session");
    };
    session.status := #completed;
    toPublic(session);
  };

  public func getActiveSessions(
    sessions : List.List<SessionTypes.Session>,
    caller : CommonTypes.UserId,
  ) : [SessionTypes.SessionPublic] {
    var results : [SessionTypes.SessionPublic] = [];
    for (s in sessions.values()) {
      let isParticipant = Principal.equal(s.requesterId, caller) or Principal.equal(s.receiverId, caller);
      let isActive = switch (s.status) {
        case (#pending) true;
        case (#confirmed) true;
        case _ false;
      };
      if (isParticipant and isActive) {
        results := results.concat([toPublic(s)]);
      };
    };
    results;
  };

  public func getCompletedSessions(
    sessions : List.List<SessionTypes.Session>,
    caller : CommonTypes.UserId,
  ) : [SessionTypes.SessionPublic] {
    var results : [SessionTypes.SessionPublic] = [];
    for (s in sessions.values()) {
      let isParticipant = Principal.equal(s.requesterId, caller) or Principal.equal(s.receiverId, caller);
      let isCompleted = switch (s.status) {
        case (#completed) true;
        case _ false;
      };
      if (isParticipant and isCompleted) {
        results := results.concat([toPublic(s)]);
      };
    };
    results;
  };
};
