require('dotenv').config();
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "hello") {
      sendResponse({ farewell: "goodbye" });
  }
});
if (!window.youTubeSorterInitialized) {
  window.youTubeSorterInitialized = true;

  const YouTubeSorter = {
   
   
    getCurrentQuerySearch() {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get("search_query");
    },

    async fetchVideoDetails(videoId) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${process.env.API_KEY}`
        );
        const data = await response.json();

        if (data.error) {
         
          return null;
        }

        return data.items?.[0] || null;
      } catch (error) {
        
        return null;
      }
    },


    // Extract video information from YouTube elements
    async extractVideoInfo(container) {
      try {
        const titleElement = container.querySelector("#video-title");
        console.log("titleElement: ",titleElement)
        const videoLink = titleElement?.href || "";
        const videoId = videoLink.split("v=")[1]?.split("&")[0];

        if (!videoId) {
  
          return null;
        }
 
        const videoDetails = await this.fetchVideoDetails(videoId);
        if (!videoDetails) {
       
          return null;
        }
      
        return {
          element: container,
          views: parseInt(videoDetails.statistics.viewCount) || 0,
          likes: parseInt(videoDetails.statistics.likeCount) || 0,
          comments: parseInt(videoDetails.statistics.commentCount) || 0,
          title: videoDetails.snippet.title,
          videoId: videoId,
          thumbnailUrl: videoDetails.snippet.thumbnails.high.url,
          publishedAt: videoDetails.snippet.publishedAt,
          
        };
      } catch (error) {
        
        return null;
      }
    },

    // Calculate video score based on multiple metrics
    calculateVideoScore(video) {
      const viewWeight = 1;
      const likeWeight = 2;
      const commentWeight = 1.5;

      const viewScore = video.views;
      const likeScore = video.likes * 100;
      const commentScore = video.comments * 50;

      return (
        viewScore * viewWeight +
        likeScore * likeWeight +
        commentScore * commentWeight
      );
    },
   
    // Sort and reorder videos
    async sortAndReorderVideos() {
      try {
        const resultsContainer = document.querySelector("#contents.ytd-section-list-renderer")
        if (!resultsContainer) {
         
          return;
        }

        // Wait a bit for dynamic content to load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const videoContainers = Array.from(
          document.querySelectorAll("ytd-video-renderer")
        );
     console.log(videoContainers);
        if (videoContainers.length === 0) {
          return;
        }


        const videoInfoPromises = videoContainers.map((container) =>
          this.extractVideoInfo.bind(this)(container)
        );
        const videoInfos = (await Promise.all(videoInfoPromises)).filter(
          (info) => info !== null
        );


        videoInfos.sort(
          (a, b) => this.calculateVideoScore(b) - this.calculateVideoScore(a)
        );

        while (resultsContainer.firstChild) {
          resultsContainer.firstChild.remove();
        }

        videoInfos.forEach((info) => {
          resultsContainer.appendChild(info.element);
        });

      } catch (error) {
        
      }
    },
      
    // Detect search page and initialize sorting
    async detectSearchPage() {
      const currentURL = window.location.href;
      if (currentURL.includes("/results?")) {
        const searchQuery = this.getCurrentQuerySearch();
        if (searchQuery) {
          await this.sortAndReorderVideos();
        }
      }
    },
   
    // Initialize the sorter
    initialize() {
      let lastUrl = location.href;
      let debounceTimer;

      const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.detectSearchPage();
          }, 1000);
        }
      });

      observer.observe(document, { subtree: true, childList: true });
      this.detectSearchPage();
    },
  };

  YouTubeSorter.initialize();
}