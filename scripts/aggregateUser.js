db.user.aggregate([{
  $match: {
    'info.errcode': {$ne: null}
  }
}, {
  $lookup: {
    from: 'message',
    localField: 'openid',
    foreignField: 'content.FromUserName',
    as: 'messages',
  }
}, {
  $unwind: '$messages',
}, {
  $match: {'messages.content.Event': 'subscribe'},
}, {
  $project: {
    openid: true,
    'messages.content.EventKey': true,
  },
}, {
  $group: {
    _id: '$openid',
    EventKey: {$first: '$messages.content.EventKey'},
  }
}, {
  $project: {
    _id: false,
    FromUserName: '$_id',
    EventKey: true,
  },
}]);
