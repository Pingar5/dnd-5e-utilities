  
// @ts-check

(function () {
    //@ts-ignore
    const vscode = acquireVsCodeApi();

    console.log("BLAH!");

    const sheetContainer = /** @type {HTMLElement} */ (document.querySelector('.sheet'));

    const errorContainer = document.createElement('div');
    document.body.appendChild(errorContainer);
    errorContainer.className = 'error';
    errorContainer.style.display = 'none';

    function updateContent(/** @type {string} */ text) {
        if (!text) {
            vscode.postMessage({
                type: 'no-content'
            });
        }

        let json;
		try {
			json = JSON.parse(text);
		} catch {
			sheetContainer.style.display = 'none';
			errorContainer.innerText = 'Error: Document is not valid json';
			errorContainer.style.display = '';
			return;
        }
		sheetContainer.style.display = '';
        errorContainer.style.display = 'none';
        
        document.querySelector(".Name").innerHTML = json.Name;
        document.querySelector(".AC").innerHTML = json.AC;
        document.querySelector(".HP").innerHTML = json.HP;
        document.querySelector(".Speed").innerHTML = json.Speed;
        document.querySelector(".Prof").innerHTML = json.Prof;
        document.querySelector(".Size").innerHTML = json.Size;
        document.querySelector(".Str").innerHTML = json.Str;
        document.querySelector(".Dex").innerHTML = json.Dex;
        document.querySelector(".Con").innerHTML = json.Con;
        document.querySelector(".Int").innerHTML = json.Int;
        document.querySelector(".Wis").innerHTML = json.Wis;
        document.querySelector(".Cha").innerHTML = json.Cha;

        var langs = "";
        for (var i = 0; i < json.Languages.length; i++) {
            langs += (i > 0 ? ", " : "") + json.Languages[i];
        }
        document.querySelector(".Languages").innerHTML = langs;

        var features = "";
        for (var i = 0; i < json.Features.length; i++) {
            var feature = json.Features[i];
            features += (i > 0 ? "<br>" : "") + "<b>" + feature.Name + "</b> " + feature.Text;
        }
        document.querySelector(".features").innerHTML = features;

        var actions = "";
        for (var i = 0; i < json.Actions.length; i++) {
            var action = json.Actions[i];
            actions += (i > 0 ? "<br>" : "") + "<b>" + action.Name + "</b> " + action.Text;
        }
        document.querySelector(".actions").innerHTML = actions;

        const legendaryActionContainer = /** @type {HTMLElement} */ (document.querySelector(".legendary-actions"));
        if (json.LegendaryActions) {
            var legendaryActions = "";
            for (var i = 0; i < json.LegendaryActions.length; i++) {
                var legendaryAction = json.LegendaryActions[i];
                legendaryActions += (i > 0 ? "<br>" : "") + "<b>" + legendaryAction.Name + "</b> " + legendaryAction.Text;
            }
            legendaryActionContainer.innerHTML = legendaryActions;
            legendaryActionContainer.style.display = '';
        } else {
            legendaryActionContainer.style.display = 'none';
        }

        const notesContainer = /** @type {HTMLElement} */ (document.querySelector(".notes"));
        if (json.Notes) {
            notesContainer.innerHTML = json.Notes
            notesContainer.style.display = '';
        } else {
            notesContainer.style.display = 'none';
        }
    }

    window.addEventListener('message', event => {
        const message = event.data;
        switch(message.type) {
            case 'update':
                const text = message.text;
                updateContent(text);
                vscode.setState({ text });
                return;
        }
    });

    const state = vscode.getState();
    if (state) {
        updateContent(state.text);
    }
}());