import CommonTypes "common";

module {
  public type Message = {
    id : CommonTypes.MessageId;
    senderId : CommonTypes.UserId;
    receiverId : CommonTypes.UserId;
    content : Text;
    timestamp : CommonTypes.Timestamp;
    var isRead : Bool;
  };

  // Shared version
  public type MessagePublic = {
    id : CommonTypes.MessageId;
    senderId : CommonTypes.UserId;
    receiverId : CommonTypes.UserId;
    content : Text;
    timestamp : CommonTypes.Timestamp;
    isRead : Bool;
  };

  public type Conversation = {
    partnerId : CommonTypes.UserId;
    partnerName : Text;
    lastMessage : ?Text;
    lastTimestamp : ?CommonTypes.Timestamp;
    unreadCount : Nat;
  };
};
