
var vm = new Vue({
    el: "#app",
    data: {
        url: "https://zk-phi.github.io/",
        strategy: "mobile",
        status: "",
        result: null,
        loading: false
    },
    mounted: function () {
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
                vm.result = JSON.parse(xhr.responseText);
                vm.status = "Completed";
                vm.loading = false;
            };
            xhr.onerror = function () {
                vm.status = "Error loading result";
                vm.loading = false;
            };
            vm.loading = true;
            vm.status = "Loading ...";
            xhr.open("GET", url, true);
            xhr.send(null);
        }
    }
});
