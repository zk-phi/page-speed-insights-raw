const simulatedTimingKeys = [
    "firstCPUIdle",
    "firstContentfulPaint",
    "firstMeaningfulPaint",
    "largestContentfulPaint",
    "interactive",
];

const observedTimingKeys = [
    "observedTimeOrigin",
    "observedNavigationStart",
    "observedFirstContentfulPaint",
    "observedFirstContentfulPaintAllFrames",
    "observedFirstMeaningfulPaint",
    "observedFirstPaint",
    "observedFirstVisualChange",
    "observedLargestContentfulPaint",
    "observedLargestContentfulPaintAllFrames",
    "observedDomContentLoaded",
    "observedLoad",
    "observedLastVisualChange",
    "observedTraceEnd",
];

function simulatedTimings (lighthouseResult) {
    if (!lighthouseResult) return [];

    return simulatedTimingKeys.map((key) => ({
        time: lighthouseResult.audits.metrics.details.items[0][key],
        key: key,
    })).sort((a, b) =>
        a.time <= b.time ? -1 : a.time == b.time ? 0 : 1
    );
}

function observedTimings (lighthouseResult) {
    if (!lighthouseResult) return [];

    const timings = observedTimingKeys.map((key) => ({
        time: lighthouseResult.audits.metrics.details.items[0][key],
        key: key,
    }));

    lighthouseResult.audits["network-requests"].details.items.forEach((item) => {
        timings.push({
            time: Math.floor(item.startTime),
            key: `loadStart ${item.url}`,
        });
        timings.push({
            time: Math.ceil(item.endTime),
            key: `loadEnd ${item.url}`,
        });
    });

    lighthouseResult.audits["long-tasks"].details.items.forEach((item) => {
        timings.push({
            time: item.startTime,
            key: `longTaskStart ${item.url}`,
        });
        timings.push({
            time: item.startTime + item.duration,
            key: `longTaskEnd ${item.url}`,
        });
    });

    return timings.sort((a, b) =>
        a.time <= b.time ? -1 : a.time == b.time ? 0 : 1
    );
}

var vm = new Vue({
    el: "#app",
    data: {
        mode: "api",
        url: "https://zk-phi.github.io/",
        jsonUrl: "res.json",
        strategy: "mobile",
        status: "",
        result: null,
        loading: false
    },
    computed: {
        simulatedTimings: function () {
            return simulatedTimings(this.result);
        },
        observedTimings: function () {
            return observedTimings(this.result);
        }
    },
    methods: {
        run: function () {
            var mode = this.mode;
            var url = mode == "json" ? this.jsonUrl : (
                "https://www.googleapis.com/pagespeedonline/v5/runPagespeed" +
                "?url=" + this.url +
                "&strategy=" + this.strategy
            );
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var json = JSON.parse(xhr.responseText);
                vm.result = mode == "json" ? json : json.lighthouseResult;
                vm.status = "Completed";
                vm.loading = false;
            };
            xhr.onerror = function () {
                vm.status = "Error loading result";
                vm.loading = false;
            };
            vm.loading = true;
            vm.status = "Loading ...";
            vm.result = null;
            xhr.open("GET", url, true);
            xhr.send(null);
        }
    }
});
