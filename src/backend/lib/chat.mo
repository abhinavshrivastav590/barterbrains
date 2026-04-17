import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import ChatTypes "../types/chat";
import ProfileTypes "../types/profile";
import CommonTypes "../types/common";

module {
  public func sendMessage(
    messages : List.List<ChatTypes.Message>,
    nextId : Nat,
    sender : CommonTypes.UserId,
    receiver : CommonTypes.UserId,
    content : Text,
  ) : ChatTypes.MessagePublic {
    let msg : ChatTypes.Message = {
      id = nextId;
      senderId = sender;
      receiverId = receiver;
      content = content;
      timestamp = Time.now();
      var isRead = false;
    };
    messages.add(msg);
    toPublicMsg(msg);
  };

  public func getMessages(
    messages : List.List<ChatTypes.Message>,
    userA : CommonTypes.UserId,
    userB : CommonTypes.UserId,
    since : ?CommonTypes.Timestamp,
  ) : [ChatTypes.MessagePublic] {
    var results : [ChatTypes.MessagePublic] = [];
    let sinceTs : CommonTypes.Timestamp = switch (since) {
      case (?t) t;
      case null 0;
    };
    for (msg in messages.values()) {
      let isConversation =
        (Principal.equal(msg.senderId, userA) and Principal.equal(msg.receiverId, userB)) or
        (Principal.equal(msg.senderId, userB) and Principal.equal(msg.receiverId, userA));
      if (isConversation and msg.timestamp >= sinceTs) {
        results := results.concat([toPublicMsg(msg)]);
      };
    };
    results;
  };

  public func markRead(
    messages : List.List<ChatTypes.Message>,
    reader : CommonTypes.UserId,
    sender : CommonTypes.UserId,
  ) {
    messages.mapInPlace(func(msg : ChatTypes.Message) : ChatTypes.Message {
      if (Principal.equal(msg.senderId, sender) and Principal.equal(msg.receiverId, reader) and not msg.isRead) {
        msg.isRead := true;
      };
      msg;
    });
  };

  public func getConversations(
    messages : List.List<ChatTypes.Message>,
    profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
    caller : CommonTypes.UserId,
  ) : [ChatTypes.Conversation] {
    // Collect unique partner IDs using a Set
    let partnerSet = Set.empty<CommonTypes.UserId>();
    for (msg in messages.values()) {
      let isMine = Principal.equal(msg.senderId, caller) or Principal.equal(msg.receiverId, caller);
      if (isMine) {
        let partnerId = if (Principal.equal(msg.senderId, caller)) msg.receiverId else msg.senderId;
        partnerSet.add(partnerId);
      };
    };

    // Build conversation summary for each partner
    var conversations : [ChatTypes.Conversation] = [];
    for (partnerId in partnerSet.values()) {
      var lastMsg : ?Text = null;
      var lastTs : ?CommonTypes.Timestamp = null;
      var unread : Nat = 0;

      for (msg in messages.values()) {
        let isConversation =
          (Principal.equal(msg.senderId, caller) and Principal.equal(msg.receiverId, partnerId)) or
          (Principal.equal(msg.senderId, partnerId) and Principal.equal(msg.receiverId, caller));
        if (isConversation) {
          let isNewer = switch (lastTs) {
            case (?ts) msg.timestamp > ts;
            case null true;
          };
          if (isNewer) {
            lastMsg := ?msg.content;
            lastTs := ?msg.timestamp;
          };
          if (Principal.equal(msg.senderId, partnerId) and not msg.isRead) {
            unread += 1;
          };
        };
      };

      let partnerName = switch (profiles.get(partnerId)) {
        case (?p) p.name;
        case null partnerId.toText();
      };

      let conv : ChatTypes.Conversation = {
        partnerId = partnerId;
        partnerName = partnerName;
        lastMessage = lastMsg;
        lastTimestamp = lastTs;
        unreadCount = unread;
      };
      conversations := conversations.concat([conv]);
    };

    conversations;
  };

  public func getUnreadCount(
    messages : List.List<ChatTypes.Message>,
    caller : CommonTypes.UserId,
    sender : CommonTypes.UserId,
  ) : Nat {
    var count : Nat = 0;
    for (msg in messages.values()) {
      if (Principal.equal(msg.senderId, sender) and Principal.equal(msg.receiverId, caller) and not msg.isRead) {
        count += 1;
      };
    };
    count;
  };

  // Private helper
  func toPublicMsg(msg : ChatTypes.Message) : ChatTypes.MessagePublic {
    {
      id = msg.id;
      senderId = msg.senderId;
      receiverId = msg.receiverId;
      content = msg.content;
      timestamp = msg.timestamp;
      isRead = msg.isRead;
    };
  };
};
