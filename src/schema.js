const { gql } = require('apollo-server');

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  scalar JSON

  type KnowledgeGraph {
    name: String
  }

  type Attachment {
    id: String
    name: String
    message: String
  }

  type Participant {
    id: String
    name: String
    email: String
    metadata: JSON
  }

  type Comm {
    id: String
    subject: String
    message: String
    ingestedAt: String
    metadata: JSON
    attachments: [Attachment]
    participants: [Participant]
  }

  input Filter {
    email: String
  }

  type Query {
    """
    Returns a list of KGs in the system
    """
    allKGs: [KnowledgeGraph]

    """
    Returns a list of Comm objects for the specified KG
    """
    comms(kg: String!, filter: Filter): [Comm]

    """
    Returns the Comm object with the given id for the specified KG
    """
    comm(kg: String!, id: String!): Comm

  }
`;

export default typeDefs;
