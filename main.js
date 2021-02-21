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

    return timings.sort((a, b) =>
        a.time <= b.time ? -1 : a.time == b.time ? 0 : 1
    );
}

var vm = new Vue({
    el: "#app",
    data: {
        url: "https://zk-phi.github.io/",
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
            var xhr = new XMLHttpRequest();
            var url = (
                "https://www.googleapis.com/pagespeedonline/v5/runPagespeed" +
                "?url=" + this.url +
                "&strategy=" + this.strategy
            );
            xhr.onload = function () {
                vm.result = JSON.parse(xhr.responseText).lighthouseResult;
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
