const _ = require('lodash');

const buildComms = (comms = []) => {
  return comms.map(buildComm);
};
const buildComm = comm => {
  return {
    id: comm._id,
    subject: comm._source.subject || null,
    message: comm._source.message || null,
    ingestedAt: comm._source.ingestion_timestamp || null,
    attachments: buildAttachments(comm._source.attachments),
    participants: buildParticipants(comm._source.participants),
    metadata: comm._source.metadata || null,
  }
};

const buildAttachments = (attachments = []) => {
  return attachments.map(buildAttachment);
};
const buildAttachment = attachment => {
  return {
    id: attachment.id,
    name: attachment.file_name,
    message: attachment.message,
  }
};

const buildParticipants = (participants = []) => {
  return participants.map(buildParticipant);
};
const buildParticipant = participant => {
  return {
    id: participant.profile_id,
    name: participant.name || null,
    email: participant.email || null,
    metadata: participant.metadata || null,
  }
};

const resolvers = {
  Query: {
    // allKGs: [KnowledgeGraph]
    allKGs: (parent, args, { es }, info) => {
      console.log('***allKGs called');

      return es.cat.indices({h:'index'})
        .then(resp => {
          // console.log('***books - es.cat.indices()', resp);
          let indexes =
            resp.body
              .split('\n')
              .filter(i=>i.length)
              .filter(i=>!i.startsWith('.'))
              .map(i => {
                return i.split('__')[0]
              });

          indexes = _.uniq(indexes);

          console.log('***allKGs - indexes', indexes);
          return indexes;
        })
        .catch(err => {
          console.log(err);
          return [];
        });
    },

    // comms(kg: String!): [Comm]
    comms: (parent, { kg, filter }, { es }, info) => {
      console.log('***comms called - ', kg, filter);

      let body;
      if (filter) {
        body = {
          'query': {
            'nested': {
              'path': 'participants',
              'query': {
                'match': {
                  'participants.email': filter.email
                }
              }
            }
          }
        }
      }

      const commType = '__comms';
      return es.search({
          index: `${kg}${commType}`,
          body
        })
        .then(resp => {
          console.log('***comms response - ', resp.body.hits.total.value);
          return buildComms(resp.body.hits.hits || []);
        })
        .catch(err => {
          console.log(err);
          return [];
        });
    },

    // comm(kg: String!, id: String!): Comm
    comm: (parent, { kg, id }, { es }, info) => {
      console.log('***comm called - ', kg, id);

      const commType = '__comms';
      return es.search({
          index: `${kg}${commType}`,
          body: {
            query: {
              match: {
                 _id: id
               }
            }
          }
        })
        .then(resp => {
          // console.log('***comm response - ', resp.body.hits.hits);
          console.log('***comm response - ', resp.body.hits.hits[0]._source.attachments);

          return buildComm(resp.body.hits.hits[0] || {});
        })
        .catch(err => {
          console.log(err);
          return [];
        });
    },

    // kg(name: String!): KnowledgeGraph
    kg: (parent, { name }, { es }, info) => {
      console.log('***kg called - ', name);
      return {
        name,
      }
    },

  },

  KnowledgeGraph: {
    // comms(filter: Filter): [Comm]
    comms: ({ name: kg }, { id, filter }, { es }, info) => {
      console.log('***KnowledgeGraph comms called - ', kg, id, filter);

      let body;
      if (id) {
        body = {
          query: {
            match: {
               _id: id
             }
          }
        }
      } else if (filter) {
        body = {
          'query': {
            'nested': {
              'path': 'participants',
              'query': {
                'match': {
                  'participants.email': filter.email
                }
              }
            }
          }
        }
      }

      const commType = '__comms';
      return es.search({
          index: `${kg}${commType}`,
          body
        })
        .then(resp => {
          console.log('***KnowledgeGraph comms response - ', resp.body.hits.total.value);
          return buildComms(resp.body.hits.hits || []);
        })
        .catch(err => {
          console.log(err);
          return [];
        });
    }

  }
};

export default resolvers;
