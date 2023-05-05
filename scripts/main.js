const url = `https://api.thecatapi.com/v1/breeds`;
const api_key = "live_LIWnFNKTpoc2xBSkKJQhgkR99RUi8VfaEEOmFAsok9hT7xSSg57Qhe3ADlEJ5yMu"
let storedBreeds = []
const breedSelector = document.getElementById("breed_selector");
const breedList = document.getElementById("breed_list");
const breedContainer = document.getElementById("breed_container")

const searchForm = document.getElementById("top-search");
const children = breedContainer.children;

function indexCat(element) {
    let cati = 0;
    for (let i = 0; i < storedBreeds.length; i++) {
        if (storedBreeds[i]['name'] === element['name']) {
            cati = i;
            break;
        }
    }
    return cati;
}

function renderMatchingBreeds(matches) {
    breedList.innerHTML = "";

    const breedButtons = matches.map(match => {
        const button = document.createElement("button");
        button.innerText = match.name;
        const index = indexCat(match)
        button.addEventListener("click", () => showBreedImage(index));
        return button;
    });

    breedButtons.forEach(button => breedList.appendChild(button));
}

function findMatchingBreeds(query) {
    const matches = storedBreeds.filter(breed => breed.name.toLowerCase().includes(query.toLowerCase()))
        .map((breed, index) => {
            return {
                name: breed.name,
                index: index
            };
        });
    return matches;
}

searchForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const query = searchForm.elements.query.value;

    const matches = findMatchingBreeds(query);

    renderMatchingBreeds(matches);

    document.getElementById("display-1").innerHTML = "Search Results";

    for (let i = 0; i < children.length; i++) {
        children[i].style.visibility = 'hidden';
    }
});

breedSelector.addEventListener("change", function() {
    showBreedImage(this.value);
});

fetch(url, {
        headers: {
            'x-api-key': api_key
        }
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {

        data = data.filter(img => img.image?.url != null)

        storedBreeds = data;

        for (let i = 0; i < storedBreeds.length; i++) {
            const breed = storedBreeds[i];
            let option = document.createElement('option');

            if (!breed.image) continue

            option.value = i;
            option.innerHTML = `${breed.name}`;
            document.getElementById('breed_selector').appendChild(option);

        }

        showBreedImage(0)
    })
    .catch(function(error) {
        console.log(error);
    });


function showBreedImage(index) {
    while (breedList.firstChild) {
        breedList.removeChild(breedList.firstChild);
    }
    for (let i = 0; i < children.length; i++) {
        children[i].style.visibility = 'visible';
    }

    document.getElementById("breed_image").src = storedBreeds[index].image.url;

    document.getElementById("breed_json").textContent = storedBreeds[index].temperament
    document.getElementById("wiki_link").href = storedBreeds[index].wikipedia_url

    document.getElementById("display-1").innerHTML = storedBreeds[index].name

    const breedurl = storedBreeds[index].wikipedia_url
    document.getElementById("wiki_link").innerHTML = breedurl;

    let breedForWiki = breedurl.substring(breedurl.lastIndexOf("/") + 1);

    breedForWiki = breedForWiki.replace(/\(/g, '').replace(/\)/g, '');


    const apiwiki = `https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=${breedForWiki}&callback=?`

    $.ajax({
        type: "GET",
        url: apiwiki,
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
            const markup = data.parse.text["*"];
            const blurb = $('<div></div>').html(markup);
            const paragraph = $(blurb).find(`p:contains('${storedBreeds[index].name}')`).first();
            const paragraphHtml = paragraph.html();
            $('#article').html(paragraphHtml);
        },

        error: function(errorMessage) {}
    });
}
