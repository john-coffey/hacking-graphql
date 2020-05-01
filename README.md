# hacking-graphql

You'll need `node` and `npm` installed.  You'll also need Elastic running
locally at http://localhost:9200 the default `elastic/changeme` username &
password will be used.  These can all be configured through environment vars.

First install all the things with `npm i`

Then run `npm start` and hit http://localhost:4000 to get to the GraphiQL 'GraphQL
Playground'.  In here you can enter queries on the left, hit the big play button
in the middle and see the result on the right.  A good query to start with is

```
query getAllKGS {
    allKGs
}
```

This will get you list of KGs in the system.  Then run this -

```
query getCommsFromKg {
  kg(name: "---a kg from the above list goes here---") {
    name
    comms {
      id
      message
    }
  }
}
```

Obviously replacing `---a kg from the above list goes here---` with a value
from the `getAllKGS` query.
