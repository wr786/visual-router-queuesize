# Visual Router QueueSize

React + AntD + AntV

## Data Format

See `src/data.json`

```json
{
    "nodes": [{ "id": "node-0" }, { "id": "node-1" }],
    "edges": [{
        "source": "node-0",
        "target": "node-1",
        "sTimeline": [
            ["0", "0"],
            ["1", "0"],
            ["2", "0"],
            ["3", "0"],
            // ...
            ["179", "52"]
        ],
        "tTimeline": [
            ["0", "0"],
            ["1", "0"],
            ["2", "0"],
            ["3", "0"],
           // ...
            ["179", "0"]
        ]
    }],
    "timeLimit": 180
}
```

## Run

```shell
npm install
npm start
```
