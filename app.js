
//creamos app o instancia vue 
const app = Vue.createApp({

    //definimos la data del componente, reactivos  
    data() {
        return {
            characters: [], //Espacio para lospersonajes obtenidos de la data(API)
            searchText: '', //Texto de busqueda
            filterAlive: false, //Filtro vivos
            totalCharacters: 0, //Total de personales
            currentPage: 'home', //Pagina actual de la app
            selectedCharacter: null, //personaje tarjeteado para motrar details
            favorites: [], //Espacio para localStorage
            currentPageNumber: 1, //Paginacion personajes
            totalPages: 0, //Paginas totales paginacion
            episodes: [], //Espacio para episodios obtenidos de la data(API)
            currentEpisodePage: 1, //Paginacion episodios
            totalEpisodePages: 0, //Paginas totales de paginacion EP
            topLocations: [],   //Espacio para ubicaciones comunes
            statusCount: {},    //Contador de estados
            speciesCount: {},   //Contador de especies
            genderCount: {}     //Contador de generos
        }
    },

    //definimos las propiedades computadas
    computed: {
        //filtramos los personajes segun el textbox y el chek de estado vivo
        filteredCharacters() {
            return this.characters.filter(character => {
                const matchesSearch = character.name.toLowerCase().includes(this.searchText.toLowerCase())
                const matchesFilter = !this.filterAlive || character.status === 'Alive'
                return matchesSearch && matchesFilter
            })
        },
        //Rango de paginas para personajes
        paginationRange() {
            const range = []
            for (let i = Math.max(1, this.currentPageNumber - 2); i <= Math.min(this.totalPages, this.currentPageNumber + 2); i++) {
                range.push(i)
            }
            return range
        },
        //Rango de paginas para episodios
        episodePaginationRange() {
            const range = []
            for (let i = Math.max(1, this.currentEpisodePage - 2); i <= Math.min(this.totalEpisodePages, this.currentEpisodePage + 2); i++) {
                range.push(i)
            }
            return range
        }
    },

    //definimos los metodos
    methods: {
        //Obtenemos personajes de la API y actualiza elementos data de la app
        async fetchCharacters(page = 1) {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
                const data = await response.json()
                this.characters = data.results
                this.totalCharacters = data.info.count
                this.totalPages = data.info.pages
                this.currentPageNumber = page
                this.calculateStats()
            } catch (error) {
                console.error('Error fetching characters:', error)
            }
        },
        //obtenemos episodios de la API y actualiza elementos data de la app
        async loadEpisodes(page = 1) {
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`)
                const data = await response.json()
                this.episodes = data.results
                this.totalEpisodePages = data.info.pages
                this.currentEpisodePage = page
            } catch (error) {
                console.error('Error fetching episodes:', error)
            }
        },
        //Calculamos estadisticas
        calculateStats() {
            this.statusCount = this.characters.reduce((acc, char) => {
                acc[char.status] = (acc[char.status] || 0) + 1
                return acc
            }, {})

            this.speciesCount = this.characters.reduce((acc, char) => {
                acc[char.species] = (acc[char.species] || 0) + 1
                return acc
            }, {})

            const locationCount = this.characters.reduce((acc, char) => {
                acc[char.location.name] = (acc[char.location.name] || 0) + 1
                return acc
            }, {})
            this.topLocations = Object.entries(locationCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count }))

            this.genderCount = this.characters.reduce((acc, char) => {
                acc[char.gender] = (acc[char.gender] || 0) + 1
                return acc
            }, {})
        },
        //Realizamos el cambio de pagina a details tomando en cuenta el personaje seleccionado
        showDetails(character) {
            this.selectedCharacter = character
            this.currentPage = 'details'
        },
        //Verifica si un personaje esta en favorito
        isFavorite(character) {
            return this.favorites.some(fav => fav.id === character.id)
        },
        //Alternamos el estado de favoritos del personaje
        toggleFavorite(character) {
            if (this.isFavorite(character)) {
                this.removeFromFavorites(character)
            } else {
                this.addToFavorites(character)
            }
        },
        //Añadimos personaje a favoritos
        addToFavorites(character) {
            if (!this.isFavorite(character)) {
                this.favorites.push(character)
                this.saveFavorites()
            }
        },

        //Eliminamos personaje de favoritos
        removeFromFavorites(character) {
            this.favorites = this.favorites.filter(fav => fav.id !== character.id)
            this.saveFavorites()
        },

        //Guardamos favoritos en local storage
        saveFavorites() {
            localStorage.setItem('favorites', JSON.stringify(this.favorites))
        },

        //Para abrir el modal de favoritos con bootstrap
        openFavoritesModal() {
            const modal = new bootstrap.Modal(document.getElementById('favoritesModal'))
            modal.show()
        },
        //Cambiamos de pagina en personajes
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.fetchCharacters(page)
            }
        },

        //Cambiamos de pagina en episodios
        goToEpisodePage(page) {
            if (page >= 1 && page <= this.totalEpisodePages) {
                this.loadEpisodes(page)
            }
        }
    },

    //montamos componentes, definimos que cargara dependiendo si estamos en episodios o favoritos
    mounted() {
        const urlParams = new URLSearchParams(window.location.search)
        const page = urlParams.get('page')

        if (page === 'episodes') {
            this.currentPage = 'episodes'
            this.loadEpisodes(1)
        } else {
            this.fetchCharacters()
        }

        const storedFavorites = localStorage.getItem('favorites')
        if (storedFavorites) {
            this.favorites = JSON.parse(storedFavorites)
        }
    },
    //Observador de cambios de pagina
    watch: {
        currentPage(newValue) {
            console.log('Current Page:', newValue)
            if (newValue === 'episodes') {
                this.loadEpisodes(1)
            }
        }
    }
})

//Inicializamos la app en el contenedor especificado en el html
app.mount('#app')